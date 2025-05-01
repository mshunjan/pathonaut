import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { Table } from "apache-arrow";
import type { AsyncDuckDB } from "duckdb-wasm-kit";

// Header-less Kraken2 column order
type ColumnOrder = [
  "percentAbundance",
  "numericAbundance",
  "cladeReads",
  "taxonomyLevel",
  "taxonomyId",
  "name"
];
const HEADERLESS_NAMES: ColumnOrder = [
  "percentAbundance",
  "numericAbundance",
  "cladeReads",
  "taxonomyLevel",
  "taxonomyId",
  "name"
];

// Synonyms for headered Bracken/Kraken reports
const COLUMN_SYNONYMS: Record<string, string[]> = {
  name: ["name", "Name"],
  taxonomyId: ["taxonomy_id", "taxid", "taxon_id", "taxID", "tax_id"],
  taxonomyLevel: ["taxonomy_level", "taxonomy_lvl", "tax_lvl", "lvl", "level", "rank", "tax_rank", "taxlevel"],
  numericAbundance: ["abundance", "num_reads", "count", "number_reads", "reads", "abundance_count", "new_est_reads", "reassigned_reads", "est_reads"],
  percentAbundance: ["percent", "percentage", "percent_abundance", "abundance_percent", "pct", "fraction_total_reads"]
};

// Utility: pick delimiter based on extension
const getDelimiter = (fileName: string): string => fileName.endsWith(".tsv") ? "\t" : ",";

// Utility: read first line of a file
async function readFirstLine(file: File): Promise<string> {
  const text = await file.text();
  return text.split(/\r?\n/)[0] || "";
}

// Check if file has any known header (Kraken or Bracken)
function hasKnownHeader(headers: string[]): boolean {
  return Object.values(COLUMN_SYNONYMS).some(syns =>
    syns.some(s => headers.map(h => h.toLowerCase()).includes(s.toLowerCase()))
  );
}

// Detect specifically a Bracken report by 'fraction_total_reads' header
function isBrackenReport(headers: string[]): boolean {
  return headers.map(h => h.toLowerCase()).includes("fraction_total_reads");
}

// Map each target key to actual header in file
function mapHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const [key, syns] of Object.entries(COLUMN_SYNONYMS)) {
    const found = syns.find(s => headers.map(h => h.toLowerCase()).includes(s.toLowerCase()));
    if (!found) throw new Error(`Missing column for '${key}'. Expected one of: ${syns.join(', ')}`);
    const actual = headers.find(h => h.toLowerCase() === found.toLowerCase())!;
    mapping[key] = actual;
  }
  return mapping;
}

// Build SQL fragment and type info for each file
async function buildSelectClause(file: File): Promise<{ sql: string; isBracken: boolean }> {
  const basename = file.name.replace(/\.[^/.]+$/, '');
  const delim = getDelimiter(file.name);
  const firstLine = await readFirstLine(file);
  const headers = firstLine.split(delim).map(h => h.trim());
  const headered = hasKnownHeader(headers);
  const bracken = headered && isBrackenReport(headers);

  if (headered) {
    const m = mapHeaders(headers);
    return {
      isBracken: bracken,
      sql: `
        SELECT
          '${basename}'       AS sample,
          "${m.name}"       AS name,
          "${m.taxonomyId}" AS taxonomyId,
          "${m.taxonomyLevel}" AS taxonomyLevel,
          "${m.numericAbundance}" AS numericAbundance,
          "${m.percentAbundance}" AS percentAbundance
        FROM read_csv_auto(
          '${file.name}',
          delim='${delim}',
          header=true
        )`
    };
  }

  // Fallback for header-less Kraken2
  return {
    isBracken: false,
    sql: `
      SELECT
        '${basename}'          AS sample,
        name                 AS name,
        taxonomyId           AS taxonomyId,
        taxonomyLevel        AS taxonomyLevel,
        numericAbundance     AS numericAbundance,
        percentAbundance     AS percentAbundance
      FROM read_csv(
        '${file.name}',
        delim='${delim}',
        header=false,
        names=${JSON.stringify(HEADERLESS_NAMES)}
      )`
  };
}

/**
 * Processes a batch of files—either all Kraken2 or all Bracken.
 * Throws if mixed.
 */
export async function handleFileSubmit(
  db: AsyncDuckDB | null,
  files: File[]
): Promise<{
  table: Table;
  columns: { accessorKey: string; header: string; size: number; minSize: number; maxSize: number; }[];
} | null> {
  if (!db || files.length === 0) return null;

  const conn = await db.connect();
  await Promise.all(
    files.map(f => db.registerFileHandle(f.name, f, DuckDBDataProtocol.BROWSER_FILEREADER, true))
  );

  // Build clauses and detect types
  const clausesInfo = await Promise.all(files.map(buildSelectClause));
  const hasBracken = clausesInfo.some(c => c.isBracken);
  const hasKraken = clausesInfo.some(c => !c.isBracken);
  if (hasBracken && hasKraken) {
    throw new Error("Cannot mix Kraken2 and Bracken reports in one batch—please upload only one type at a time.");
  }

  const unionSQL = clausesInfo.map(c => c.sql).join("\nUNION ALL\n");
  const allBracken = hasBracken;

  // Choose normalization only for Kraken2
  const normalizedSQL = allBracken
    ? `
      WITH raw AS (
        ${unionSQL}
      )
      SELECT
        sample,
        name,
        taxonomyId,
        taxonomyLevel,
        numericAbundance,
        percentAbundance
      FROM raw
      WHERE taxonomyLevel = 'S'
    `
    : `
      WITH raw AS (
        ${unionSQL}
      )
      SELECT
        sample,
        name,
        taxonomyId,
        taxonomyLevel,
        numericAbundance,
        ROUND(
          100.0 * numericAbundance
            / SUM(numericAbundance) OVER (PARTITION BY sample),
          2
        ) AS percentAbundance
      FROM raw
      WHERE taxonomyLevel = 'S'
    `;

  const arrowTable: Table = await conn.query(normalizedSQL);
  await conn.close();

  const columns = [
    { accessorKey: 'sample', header: 'Sample', size: 100, minSize: 50, maxSize: 200 },
    { accessorKey: 'name', header: 'Name', size: 100, minSize: 50, maxSize: 200 },
    { accessorKey: 'taxonomyId', header: 'Taxonomy ID', size: 100, minSize: 50, maxSize: 200 },
    { accessorKey: 'taxonomyLevel', header: 'Taxonomy Level', size: 150, minSize: 50, maxSize: 200 },
    { accessorKey: 'numericAbundance', header: 'Numerical Abundance', size: 150, minSize: 50, maxSize: 200 },
    { accessorKey: 'percentAbundance', header: 'Percent Abundance', size: 150, minSize: 50, maxSize: 200 }
  ];

  return { table: arrowTable, columns };
}
