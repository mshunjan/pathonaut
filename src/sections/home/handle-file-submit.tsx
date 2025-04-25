import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import type { Table } from "apache-arrow";
import type { AsyncDuckDB, } from "duckdb-wasm-kit";

export interface FormValues {
    files: File[];
}

/**
 * Handles file registration and querying for DuckDB, returning the resulting Arrow table and column definitions.
 */
export async function handleFileSubmit(
    db: AsyncDuckDB | null,
    data: FormValues
): Promise<{ table: Table; columns: { accessorKey: string; header: string; size: number; minSize: number; maxSize: number; }[] } | null> {
    if (!db) return null;

    const conn = await db.connect();

    // Register each file for DuckDB reading
    await Promise.all(
        data.files.map(file =>
            db.registerFileHandle(
                file.name,
                file,
                DuckDBDataProtocol.BROWSER_FILEREADER,
                true
            )
        )
    );

    // Build a UNION ALL query for all CSVs
    const unionSQL = data.files
        .map(file => {
            const basename = file.name.replace(/\.[^/.]+$/, '');
            return `SELECT *, '${basename}' AS sample FROM read_csv_auto('${file.name}')`;
        })
        .join("\nUNION ALL\n");

    // Execute query and build columns
    const arrowTable: Table = await conn.query(unionSQL);
    const fields = arrowTable.schema.fields;
    const columns = fields.map(field => ({
        accessorKey: field.name,
        header: field.name,
        size: 100,
        minSize: 50,
        maxSize: 200,
    }));

    await conn.close();


    return { table: arrowTable, columns };
}