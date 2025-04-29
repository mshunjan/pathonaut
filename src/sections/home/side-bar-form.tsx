"use client";

import * as React from "react";
import { Sidebar, SidebarContent, SidebarSeparator } from "@/components/ui/sidebar";
import FormCombobox from "@/components/form/form-combobox";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { FormSwitch } from "@/components/form";
import FormInput from "@/components/form/form-text";
import { useFormContext } from "react-hook-form";

const panelOptions = [
  { id: "1", name: "Panel 1", pathogens: ["1", "3", "5"] },
  { id: "2", name: "Panel 2", pathogens: ["2", "4", "6"] },
  { id: "3", name: "Panel 3", pathogens: ["1", "2", "7"] },
  { id: "4", name: "Panel 4", pathogens: ["3", "4", "8"] },
];

const pathogenOptions = [
  { id: "1", name: "Pathogen 1", taxid: 1 },
  { id: "2", name: "Pathogen 2", taxid: 2 },
  { id: "3", name: "Pathogen 3", taxid: 3 },
  { id: "4", name: "Pathogen 4", taxid: 4 },
  { id: "5", name: "Pathogen 5", taxid: 5 },
  { id: "6", name: "Pathogen 6", taxid: 6 },
  { id: "7", name: "Pathogen 7", taxid: 7 },
  { id: "8", name: "Pathogen 8", taxid: 8 },
];

export type SideBarFormProps = React.ComponentProps<typeof Sidebar>;

export function SideBarForm({ ...props }: SideBarFormProps) {
  const { watch, setValue } = useFormContext();
  const selectedPanel = watch("panel");
  
  React.useEffect(() => {
    if (selectedPanel && selectedPanel.pathogens) {
      const selectedPathogens = pathogenOptions.filter((option) =>
        selectedPanel.pathogens.includes(option.id)
      );
      setValue("pathogens", selectedPathogens);
    } else {
      setValue("pathogens", []); // Clear selection if no panel selected.
    }
  }, [selectedPanel, setValue]);

  return (
    <Sidebar variant="floating" className="top-[var(--header-height)]" {...props}>
      <SidebarContent className="flex flex-col gap-10 p-4">
        <div className="flex flex-col gap-4">
          <FormLabel>Pathogen(s)</FormLabel>
          <FormDescription>
            Screen individual pathogens or choose from a pre-selected panel of pathogens.
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

          <FormLabel>Threshold(s)</FormLabel>
          <FormDescription>
            Choose a minimum threshold for pathogen detection.
          </FormDescription>
          <div className="flex items-center space-x-2">
            <FormInput name="numericalThreshold" label="Num (#)" type="number" />
            <FormInput name="percentThreshold" label="Percent (%)" type="number" />
          </div>
        </div>

        <SidebarSeparator className="my-4" />
      </SidebarContent>
    </Sidebar>
  );
}
