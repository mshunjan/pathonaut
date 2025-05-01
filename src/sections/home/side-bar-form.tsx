"use client";

import * as React from "react";
import { Sidebar, SidebarContent, SidebarSeparator } from "@/components/ui/sidebar";
import FormCombobox from "@/components/form/form-combobox";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { FormSwitch } from "@/components/form";
import FormInput from "@/components/form/form-text";
import { useFormContext } from "react-hook-form";
import { useDuckDbQuery } from "duckdb-wasm-kit";

export interface Pathogen {
  id: string;
  name: string;
}

export interface Panel {
  id: string;
  name: string;
  pathogenIds: Set<string>; // IDs of pathogens in this panel
}

const APDB_RAW = "https://raw.githubusercontent.com/aligndx/apdb/main/panels.csv"; // Replace with your actual path
const KRAKEN_INDEX = "https://genome-idx.s3.amazonaws.com/kraken/pluspfp_08gb_20231009/inspect.txt"; // Replace with your actual path

export type SideBarFormProps = React.ComponentProps<typeof Sidebar>;

export function SideBarForm({ ...props }: SideBarFormProps) {
  // Use arrays for panel and pathogen options.
  const [panelOptions, setPanelOptions] = React.useState<Panel[]>([]);
  const [pathogenOptions, setPathogenOptions] = React.useState<Pathogen[]>([]);

  const { watch, setValue } = useFormContext();
  const selectedPanel = watch("panel");

  const panelSql = `
    WITH unpivoted_data AS (
        SELECT
            TaxID,
            panel_name,
            panel_value
        FROM read_csv_auto('${APDB_RAW}')
        UNPIVOT (panel_value FOR panel_name IN (
            "COVID-19",
            "Human Pathogenic Viruses",
            "CDC high-consequence viruses",
            "WHO priority pathogens"
        ))
        WHERE panel_value = 'Y'
    )
    SELECT 
        panel_name AS name, 
        array_agg(TaxID) AS pathogenIds
    FROM unpivoted_data
    GROUP BY panel_name;
  `;

  const pathogenSql = `
  SELECT 
      column4 AS TaxID, 
      trim(replace(replace(replace(column5, '[', ''), ']', ''), '''', '')) AS Organism
  FROM read_csv_auto('${KRAKEN_INDEX}')
  WHERE column3 IN ('S')
  ORDER BY LOWER(trim(replace(replace(replace(column5, '[', ''), ']', ''), '''', '')));
`;

  const { arrow: panelArrow, loading: loadingPanels, error: panelError } = useDuckDbQuery(panelSql);
  const { arrow: pathogenArrow, loading: loadingPathogens, error: pathogenError } = useDuckDbQuery(pathogenSql);

  // Parse the panels, and from them derive the complete set of panel options.
  React.useEffect(() => {
    if (panelArrow) {
      const rows = panelArrow.toArray ? panelArrow.toArray() : [];
      const panels: Panel[] = rows.map((row: any) => ({
        id: row.name, // using panel name as unique id
        name: row.name,
        pathogenIds: new Set(row.pathogenIds), // row.pathogenIds should be an array
      }));
      setPanelOptions(panels);
    }
  }, [panelArrow]);


  // Parse the pathogens.
  React.useEffect(() => {
    if (pathogenArrow) {
      const rows = pathogenArrow.toArray ? pathogenArrow.toArray() : [];
      const pathogens: Pathogen[] = rows.map((row: any) => ({
        id: row.TaxID, // using TaxID as unique id
        name: row.Organism,
      }));
      setPathogenOptions(pathogens);
    }
  }, [pathogenArrow]);

  // When the selected panel changes, update the form's "pathogens" value.
  React.useEffect(() => {
    if (selectedPanel && selectedPanel.pathogenIds) {
      const selectedPathogens = pathogenOptions.filter((option) =>
        selectedPanel.pathogenIds.has(option.id)
      );
      setValue("pathogens", selectedPathogens);
    } else {
      setValue("pathogens", []); // Clear selection if no panel is selected.
    }
  }, [selectedPanel, setValue, pathogenOptions]);

  if (loadingPanels || loadingPathogens) {
    return;
  }

  if (panelError || pathogenError) {
    return <div>Error loading data: {
      panelError?.message}</div>;
  }

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
            items={pathogenOptions} // Always show all derived options.
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
