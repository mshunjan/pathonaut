'use client'
import * as React from "react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { toast } from "sonner";
import { useDuckDb } from "duckdb-wasm-kit";
import type { Table } from "apache-arrow";
import { DataTable } from "./explorer-table";
import { ColumnDef } from "@tanstack/react-table";
import { handleFileSubmit } from "./handle-file-submit";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { SiteHeader } from "./header";
import FormFileSelect from "./form-file-select";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SideBarForm } from "./side-bar-form";

function HomeContent() {
  const [columns, setColumns] = React.useState<ColumnDef<unknown>[]>([]);
  const { db, loading: dbLoading, error } = useDuckDb();
  const [table, setTable] = React.useState<Table | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [firstStepTriggered, setFirstStepTriggered] = React.useState(false);

  const { toggleSidebar } = useSidebar();

  const formSchema = z.object({
    files: z
      .array(z.custom<File>())
      .min(1, "Please select at least one file"),
    selectedData: z
      .array(z.custom<File>()),
    panel: z.string(),
    pathogens: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ),
    toggleDetected: z.boolean(),
    numericalThreshold: z.coerce.number().min(0),
    percentThreshold: z.coerce.number().min(0).max(100),
  });

  type FormValues = z.infer<typeof formSchema>;


  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      selectedData: [],
      toggleDetected: true,
      panel: "",
      pathogens: [],
      numericalThreshold: 0,
      percentThreshold: 1,
    },
  });

  const onSubmit = React.useCallback(
    async (data: FormValues) => {

      // Check if any files are selected
      if (data.files.length > 0 && firstStepTriggered == false) {
        if (!db || dbLoading || error) return;

        setLoading(true);
        const result = await handleFileSubmit(db, data.files);
        if (result) {
          setTable(result.table);
          setColumns(result.columns);
          toast.success("Table loaded successfully");
          toggleSidebar()
          setFirstStepTriggered(true)
        }
        else {
          toast.error("Table could not be loaded");
        }
        setLoading(false);
      }

    },
    [db, dbLoading, error, toggleSidebar, firstStepTriggered]
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

  const firstStep = React.useMemo(
    () => (
      <div className="flex flex-col items-center justify-center gap-10">
        {welcomeMessage}
        <div className="w-full max-w-2xl flex flex-col gap-4">
          <FormFileSelect name="files" />

        </div>
      </div>
    ), [welcomeMessage]);

  const { toggleDetected, pathogens, numericalThreshold, percentThreshold } = methods.watch();

  const filteredData = React.useMemo(() => {
    if (!table) return [];
    const allRows = table.toArray();
    if (!toggleDetected) return allRows;

    return allRows.filter((row) => {
      if (
        pathogens.length > 0 &&
        !pathogens.some((p: { id: string }) => p.id === row.taxonomyId)
      ) {
        return false;
      }
      if (row.numericAbundance < numericalThreshold) {
        return false;
      }
      if (row.percentAbundance < percentThreshold) {
        return false;
      }
      return true;
    });
  }, [table, toggleDetected, pathogens, numericalThreshold, percentThreshold]);

  const dataTable = React.useMemo(
    () => (<div className="w-full flex-1 flex flex-col px-20 overflow-x-auto">
      <DataTable
        columns={columns}
        data={filteredData || []}
        loading={loading}
      />
    </div>
    ),
    [columns, filteredData, loading]
  );

  return (
    <div className="flex flex-1">
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full flex flex-1 flex-row">
          <SidebarInset className="flex-1 flex flex-col gap-10 items-center justify-center overflow-hidden">
            {!table && firstStep}
            {table && dataTable}
          </SidebarInset>
          <SideBarForm side="right" />
        </form>
      </Form>
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider className="flex flex-col" defaultOpen={false}>
      <SiteHeader />
      <HomeContent />
    </SidebarProvider>
  );
}