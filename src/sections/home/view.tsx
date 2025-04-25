'use client'
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import * as React from "react";
import FileSelectForm, { FormValues } from "./file-select-form";
import { TextAnimate } from "@/components/magicui/text-animate";
import { toast } from "sonner";
import { useDuckDb } from "duckdb-wasm-kit";
import type { Table } from "apache-arrow"
import { DataTable } from "./explorer-table";
import { ColumnDef } from "@tanstack/react-table";
import { handleFileSubmit } from "./handle-file-submit";

export default function Home() {
  const [columns, setColumns] = React.useState<ColumnDef<unknown>[]>([])
  const { db, loading, error } = useDuckDb();
  const [table, setTable] = React.useState<Table | null>(null)

  const onSubmit = React.useCallback(
    async (data: FormValues) => {
      if (!db || loading || error) return;
      const result = await handleFileSubmit(db, data);
      if (result) {
        setTable(result.table);
        setColumns(result.columns);
        toast.success('Table loaded successfully');
      }
    },
    [db, loading, error]
  );
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
      <div className="p-4 flex-1 flex flex-col gap-10 items-center justify-center">
        {table && <DataTable columns={columns} data={table?.toArray() || []} loading={loading} />}
      </div>
    </main>
  );
}