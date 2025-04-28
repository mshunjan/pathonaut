"use client";

import * as React from "react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export type SideBarFormProps = React.ComponentProps<typeof Sidebar>;

export function SideBarForm({ ...props }: SideBarFormProps) {
  // const { watch } = useFormContext();

  // // Watch the shared "data" array from the form
  // const selectedData: Array<File> = watch("files", []);

  // // Compute options via useMemo to reflect selectedData (deduplicated)
  // const options = React.useMemo(() => {
  //   const map = new Map<number, File>();
  //   selectedData.forEach((item, idx) => map.set(idx, item));
  //   return Array.from(map.values()).map((file, idx) => ({
  //     id: idx.toString(),
  //     name: file.name,
  //   }));
  // }, [selectedData]);


  return (
    <Sidebar variant="floating" className="top-[var(--header-height)]" {...props}>
      <SidebarContent className="flex flex-col gap-4 p-4">
        {/* Combobox bound to RHF via internal FormField wiring */}
        {/* <FormCombobox
          name="selectedData"
          label="Source(s)"
          description="Manage your selected data."
          title="Data"
          items={options}
          multiple
          onChange={(selectedItems: { id: string; name: string }[]) => {
            const selectedFiles = selectedItems.map((item) => selectedData[parseInt(item.id)]);
            console.log("Selected Files:", selectedFiles);
          }}
        /> */}
      </SidebarContent>
    </Sidebar>
  );
}
