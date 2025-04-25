"use client"

import { DataTableColumnHeader } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"

export const useColumns = () => {

  const columns: ColumnDef<unknown>[] = [
    {
      accessorKey: "submission",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submission" />
      ),
    },
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
      accessorKey: "taxonomy_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Taxonomy ID" />
      ),
    },
    {
      accessorKey: "taxonomy_lvl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Taxonomy Level" />
      ),
    },
    {
      accessorKey: "abundance_num",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Numerical Abundance" />
      ),
    },
    {
      accessorKey: "abundance_frac",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fractional Abundance" />
      ),
    },
  ]

  return columns
}
