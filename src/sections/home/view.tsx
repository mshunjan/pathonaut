'use client'
import * as React from "react";
import FileSelectForm, { FormValues } from "./file-select-form";
import { TextAnimate } from "@/components/magicui/text-animate";
import { toast } from "sonner";
import { useDuckDb } from "duckdb-wasm-kit";
import type { Table } from "apache-arrow"
import { DataTable } from "./explorer-table";
import { ColumnDef } from "@tanstack/react-table";
import { handleFileSubmit } from "./handle-file-submit";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SideBarForm } from "./side-bar-form";
import { SiteHeader } from "./header";

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
      <SidebarProvider className="flex flex-col" defaultOpen={false}>
        <SiteHeader />
        <div className="flex flex-1">
          <SidebarInset className="flex-1 flex flex-col gap-10 items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-10">
              {welcomeMessage}
              <FileSelectForm onSubmit={onSubmit} />
            </div>
            {table && <DataTable columns={columns} data={table?.toArray() || []} loading={loading} />}
          </SidebarInset>
          <SideBarForm side="right" />
        </div>

      </SidebarProvider>


  );
}