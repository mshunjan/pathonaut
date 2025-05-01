import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import { Table } from "apache-arrow";
import type { AsyncDuckDB } from "duckdb-wasm-kit";

// Expected column names for headerless Kraken2 reports (in order):
const HEADERLESS_NAMES = [
  "percentAbundance",
  "numericAbundance",
  "cladeReads",
  "taxonomyLevel",
  "taxonomyId",
  "name"
];

// Synonyms for headered Bracken/Kraken reports
const COLUMN_SYNONYMS: Record<string,string[]> = {
  name: ["name", "Name"],
  taxonomyId: ["taxonomy_id", "taxid", "taxon_id", "taxID", "tax_id"],
  taxonomyLevel: ["taxonomy_level", "lvl", "level", "rank", "tax_rank", "taxlevel"],
  numericAbundance: ["abundance", "num_reads", "count", "number_reads", "reads", "abundance_count"],
  percentAbundance: ["percent", "percentage", "percent_abundance", "abundance_percent", "pct"]
};

// Find a header matching any of the synonyms
function findHeader(headers: string[], synonyms: string[]): string|null {
  return synonyms
    .map(s => headers.find(h => h.toLowerCase() === s.toLowerCase()))
    .find(h => h != null) || null;
}

/**
 * Handles CSV/TSV submission for Kraken/Bracken reports, headered or not.
 * Uses DuckDB's `names` option to auto-assign columns if header=false.
 */
export async function handleFileSubmit(
  db: AsyncDuckDB | null,
  files: File[]
): Promise<{ table: Table; columns: { accessorKey: string; header: string; size: number; minSize: number; maxSize: number; }[] } | null> {
  if (!db || files.length === 0) return null;
  const conn = await db.connect();
  await Promise.all(files.map(f => db.registerFileHandle(f.name, f, DuckDBDataProtocol.BROWSER_FILEREADER, true)));

  // Build per-file SELECT clauses
  const selects = await Promise.all(files.map(async file => {
    const basename = file.name.replace(/\.[^/.]+$/, '');
    const delim = file.name.endsWith('.tsv') ? "\t" : ',';
    const text = await file.text();  // to inspect header line synchronously in JS
    const firstLine = text.split(/\r?\n/)[0] || '';
    const headers = firstLine.split(delim).map(h => h.trim());
    const hasHeader = Object.values(COLUMN_SYNONYMS).some(syns => findHeader(headers, syns) !== null);

    if (hasHeader) {
      // Map actual headers to our standard names via synonyms
      const mappings = Object.fromEntries(
        Object.entries(COLUMN_SYNONYMS).map(([key, syns]) => {
          const match = findHeader(headers, syns)!;
          return [key, match];
        })
      );
      return `
        SELECT
          '${basename}' AS sample,
          "${mappings.name}" AS name,
          "${mappings.taxonomyId}" AS taxonomyId,
          "${mappings.taxonomyLevel}" AS taxonomyLevel,
          "${mappings.numericAbundance}" AS numericAbundance,
          "${mappings.percentAbundance}" AS percentAbundance
        FROM read_csv_auto(
          '${file.name}',
          delim='${delim}',
          header=true
        )
      `;
    } else {
      // No header: let DuckDB assign names, then select the columns we care about
      return `
        SELECT
          '${basename}' AS sample,
          name,
          taxonomyId,
          taxonomyLevel,
          numericAbundance,
          percentAbundance
        FROM read_csv(
          '${file.name}',
          delim='${delim}',
          header=false,
          names=${JSON.stringify(HEADERLESS_NAMES)}
        )
      `;
    }
  }));

  // Combine and execute
  const sql = selects.join('\nUNION ALL\n');
  const arrowTable: Table = await conn.query(sql);
  await conn.close();

  // Define columns for UI
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
