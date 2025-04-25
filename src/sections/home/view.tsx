'use client'
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import * as React from "react";
import FileSelectForm, { FormValues } from "./file-select-form";
import { TextAnimate } from "@/components/magicui/text-animate";
import { toast } from "sonner";
import { useDuckDb } from "duckdb-wasm-kit";
import { DuckDBDataProtocol } from "@duckdb/duckdb-wasm";
import type { Table } from "apache-arrow"

export default function Home() {
  const { db, loading, error } = useDuckDb();
  const [table, setTable] = React.useState<Table | null>(null)

  const onSubmit = React.useCallback(async (data: FormValues) => {
    if (!db) return;
    if (loading) return;
    if (error) return;

    // 1) get a connection
    const conn = await db.connect();

    await Promise.all(data.files.map(file =>
      db.registerFileHandle(
        file.name,                             // e.g. "sample1.csv"
        file,                                  // your File object
        DuckDBDataProtocol.BROWSER_FILEREADER, // stream protocol
        true                                   // directIO: true
      )
    ))

    const unionSQL = data.files
      .map(file => {
        const basename = file.name.replace(/\.[^/.]+$/, '')
        return `
        SELECT
          *, 
          '${basename}' AS sample
        FROM read_csv_auto('${file.name}')
      `
      })
      .join('\nUNION ALL\n')

    const arrowTable: Table = await conn.query(unionSQL)
    setTable(arrowTable)

    console.log('table', arrowTable.toArray())
    await conn.close()


    toast.success('Files registered — loading combined table…')

  }, [db, loading, error]);



  const welcomeMessage = React.useMemo(() => (
    <TextAnimate animation="blurInUp" by="character" once className="font-medium text-xl mt-4">
      Pathonaut is a pathogen screening tool.
    </TextAnimate>
  ), []);


  return (
    <main className="relative flex min-h-screen flex-col">
      <header className="w-full flex items-center justify-between p-4">
        <Logo full={false} />
        <ThemeToggle />
      </header>
      <div className="flex-1 flex flex-col gap-10 items-center justify-center">
        {welcomeMessage}
        <FileSelectForm onSubmit={onSubmit} />
      </div>
    </main>
  );
}