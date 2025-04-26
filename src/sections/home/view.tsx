'use client'
import * as React from "react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { toast } from "sonner";
import { useDuckDb } from "duckdb-wasm-kit";
import type { Table } from "apache-arrow";
import { DataTable } from "./explorer-table";
import { ColumnDef } from "@tanstack/react-table";
import { handleFileSubmit } from "./handle-file-submit";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "./header";
import FormFileSelect from "./form-file-select";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SideBarForm } from "./side-bar-form";

export default function Home() {
  const [columns, setColumns] = React.useState<ColumnDef<unknown>[]>([]);
  const { db, loading, error } = useDuckDb();
  const [table, setTable] = React.useState<Table | null>(null);

  const formSchema = z.object({
    files: z
      .array(z.custom<File>())
      .min(1, "Please select at least one file"),
    selectedData: z
      .array(z.custom<File>())

  });

  type FormValues = z.infer<typeof formSchema>;


  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [], // Preload files into the form state
      selectedData: []
    },
  });

  const onSubmit = React.useCallback(
    async (data: FormValues) => {

      // Check if any files are selected
      if (data.selectedData.length > 0) {
        if (!db || loading || error) return;

        const result = await handleFileSubmit(db, data.selectedData);
        if (result) {
          setTable(result.table);
          setColumns(result.columns);
          toast.success("Table loaded successfully");
        }
      }

    },
    [db, loading, error]
  );

  const welcomeMessage = React.useMemo(
    () => (
      <TextAnimate
        animation="blurInUp"
        by="character"
        once
        className="font-medium text-xl mt-4"
      >
        Pathonaut is a pathogen screening tool.
      </TextAnimate>
    ),
    []
  );

  return (
    <SidebarProvider className="flex flex-col" defaultOpen={false}>
      <SiteHeader />
      <div className="flex flex-1">
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full flex flex-1">
            <SidebarInset className="flex-1 flex flex-col gap-10 items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-10">
                {welcomeMessage}
                <div className="w-full max-w-2xl flex flex-col gap-4">
                  <FormFileSelect name="files" />

                </div>
              </div>
              {table && (
                <DataTable
                  columns={columns}
                  data={table?.toArray() || []}
                  loading={loading}
                />
              )}
            </SidebarInset>
            <SideBarForm side="right" />
          </form>
        </Form>


      </div>
    </SidebarProvider>
  );
}