import React, { useRef } from "react";
import { Table } from "@tanstack/react-table";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartForm } from "../chart";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BarChart, X } from "lucide-react";

interface DataTableVisualizeProps<TData extends Record<string, unknown>> {
  table: Table<TData>;
}

export function DataTableVisualize<TData extends Record<string, unknown>>({ table }: DataTableVisualizeProps<TData>) {
  const chartRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const isMobile = useMediaQuery("sm", "down");

  // Extract data from table rows for the ChartForm.
  const data = table.getCoreRowModel().rows.map((row) => row.original);

  // If there's no data, do not render the drawer.
  if (data.length === 0) {
    return null;
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-2"><BarChart /> Visualize</Button>
      </DrawerTrigger>
      <DrawerContent className="min-w-full h-screen">
        <DrawerHeader className="flex flex-row px-20 justify-between items-center">
          <div className="flex flex-col text-left gap-2">
            <DrawerTitle>Visualize Data</DrawerTitle>
            <DrawerDescription>Visualize your transformed table data.</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant={"ghost"}><X /></Button>
          </DrawerClose>
        </DrawerHeader>

        <div
          className={cn(
            "flex flex-grow h-full w-full gap-4 p-10",
            isMobile ? "flex-col" : "flex-row"
          )}>
          <ChartContainer
            ref={chartRef}
            className="flex flex-grow h-full w-full items-center justify-center"
          />
          <ChartForm
            className={cn(
              "flex flex-col gap-4",
              !isMobile ? "w-[400px] " : ""
            )}
            chartRef={chartRef}
            data={data}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
