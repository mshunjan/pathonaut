"use client";

import * as React from "react";
import { Sidebar, SidebarContent, SidebarSeparator } from "@/components/ui/sidebar";
import FormCombobox from "@/components/form/form-combobox";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { FormSwitch } from "@/components/form";
import FormInput from "@/components/form/form-text";

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

  const panelOptions = [
    { id: "1", name: "Panel 1" },
    { id: "2", name: "Panel 2" },
    { id: "3", name: "Panel 3" },
    { id: "4", name: "Panel 4" },]

  const pathogenOptions = [
    { id: "1", name: "Pathogen 1" },
    { id: "2", name: "Pathogen 2" },
    { id: "3", name: "Pathogen 3" },
    { id: "4", name: "Pathogen 4" },
    { id: "5", name: "Pathogen 5" },
    { id: "6", name: "Pathogen 6" },
    { id: "7", name: "Pathogen 7" },
    { id: "8", name: "Pathogen 8" },]


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


        <FormLabel>
          Pathogen(s)
        </FormLabel>
        <FormDescription>
          Screen Individual pathogens or choose from a pre-selected panel of pathogens.
        </FormDescription>

        <div className="flex items-center space-x-2">
          <FormSwitch name="toggleDetected" />
          <FormLabel htmlFor="only-detected">Only detected</FormLabel>
        </div>

        <FormCombobox
          name="panel"
          title="Select a panel"
          items={panelOptions}
          multiple={false}
        />

        <FormCombobox
          name="pathogens"
          title="Select pathogen(s)"
          items={pathogenOptions}
          multiple
        />

        <FormInput name="threshold" label="Threshold" type="number"/>

        <SidebarSeparator className="my-4" />

      </SidebarContent>
    </Sidebar>
  );
}
