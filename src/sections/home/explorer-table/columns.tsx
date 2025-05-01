"use client"

import { DataTableColumnHeader } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"

export const useColumns = () => {

  const columns: ColumnDef<unknown>[] = [
    {
      accessorKey: "sample",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sample" />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "taxonomyId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Taxonomy ID" />
      ),
    },
    {
      accessorKey: "taxonomyLevel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Taxonomy Level" />
      ),
    },
    {
      accessorKey: "numericAbundance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Numerical Abundance" />
      ),
    },
    {
      accessorKey: "percentAbundance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Percent Abundance" />
      ),
    },
  ]

  return columns
}
