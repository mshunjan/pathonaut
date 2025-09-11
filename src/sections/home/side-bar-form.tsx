"use client";

import * as React from "react";
import { Sidebar, SidebarContent, SidebarSeparator } from "@/components/ui/sidebar";
import FormCombobox from "@/components/form/form-combobox";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { FormSwitch } from "@/components/form";
import FormInput from "@/components/form/form-text";
import { useFormContext } from "react-hook-form";
import { useDuckDbQuery } from "duckdb-wasm-kit";
import { HelpCircleIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export interface Pathogen {
  id: string;
  name: string;
}

export interface Panel {
  id: string;
  name: string;
  /** IDs of pathogens in this panel */
  pathogenIds: string[];
}

// -------------------------
// Constants & SQL (stable)
// -------------------------
const APDB_RAW_URL =
  "https://raw.githubusercontent.com/aligndx/apdb/main/panels.csv" as const;
const KRAKEN_INDEX_URL =
  "https://genome-idx.s3.amazonaws.com/kraken/pluspfp_08gb_20231009/inspect.txt" as const;

// Cast to VARCHAR to guarantee string IDs that match form items
const PANEL_SQL = `
  WITH unpivoted_data AS (
    SELECT
      CAST(TaxID AS VARCHAR) AS TaxID,
      panel_name,
      panel_value
    FROM read_csv_auto('${APDB_RAW_URL}')
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

const PATHOGEN_SQL = `
  SELECT 
    CAST(column4 AS VARCHAR) AS TaxID,
    trim(replace(replace(replace(column5, '[', ''), ']', ''), '\''', '')) AS Organism
  FROM read_csv_auto('${KRAKEN_INDEX_URL}')
  WHERE column3 IN ('S')
  ORDER BY LOWER(trim(replace(replace(replace(column5, '[', ''), ']', ''), '\''', '')));
`;

export type SideBarFormProps = React.ComponentProps<typeof Sidebar>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useArrowRows<T = any>(arrow: any): T[] {
  return React.useMemo(() => {
    try {
      if (!arrow || typeof arrow.toArray !== "function") return [] as T[];
      return arrow.toArray() as T[];
    } catch {
      return [] as T[];
    }
  }, [arrow]) as T[];
}

const SideBarFormComponent: React.FC<SideBarFormProps> = (props) => {
  const { watch, setValue } = useFormContext();

  // Run queries
  const {
    arrow: panelArrow,
    loading: panelsLoading,
    error: panelsError,
  } = useDuckDbQuery(PANEL_SQL);

  const {
    arrow: pathogenArrow,
    loading: pathogensLoading,
    error: pathogensError,
  } = useDuckDbQuery(PATHOGEN_SQL);

  const isLoading = panelsLoading || pathogensLoading;

  // Parse rows (memoized, no extra state or effects)
  const panelRows = useArrowRows<{ name: string; pathogenIds: string[] }>(panelArrow);
  const pathogenRows = useArrowRows<{ TaxID: string; Organism: string }>(pathogenArrow);

  const panelOptions: Panel[] = React.useMemo(
    () =>
      panelRows.map((row) => ({
        id: row.name,
        name: row.name,
        pathogenIds: row.pathogenIds ?? [],
      })),
    [panelRows]
  );

  const pathogenOptions: Pathogen[] = React.useMemo(
    () =>
      pathogenRows.map((row) => ({
        id: row.TaxID,
        name: row.Organism,
      })),
    [pathogenRows]
  );

  // Keep pathogens in sync when panel changes
  const selectedPanel = watch("panel") as Panel | undefined;
  React.useEffect(() => {
    if (!selectedPanel) {
      setValue("pathogens", [], { shouldDirty: true, shouldValidate: true });
      return;
    }
    const idSet = new Set(selectedPanel.pathogenIds);
    const selectedPathogens = pathogenOptions.filter((p) => idSet.has(p.id));
    setValue("pathogens", selectedPathogens, { shouldDirty: true, shouldValidate: true });
  }, [selectedPanel, pathogenOptions, setValue]);

  // Loading / error states
  if (isLoading) return null; // Let parent show a skeleton/spinner; avoids layout shift here

  if (panelsError || pathogensError) {
    return (
      <div className="text-sm text-red-600">
        Error loading data: {panelsError?.message || pathogensError?.message}
      </div>
    );
  }

  return (
    <Sidebar variant="floating" className="top-[var(--header-height)]" {...props}>
      <SidebarContent className="flex flex-col gap-10 p-4">
        <div className="flex flex-col gap-4">
          <FormLabel>
            Pathogen(s)
            <HoverCard>
              <HoverCardTrigger aria-label="Learn about panels and organisms" className="ml-2 inline-flex">
                <HelpCircleIcon className="h-4" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="flex flex-col gap-4 text-sm">
                    <div>
                      <strong className="font-semibold">Panels:</strong> Panels are pre-selected groups of pathogens curated for specific purposes. These are pulled from the {" "}
                      <a
                        href={APDB_RAW_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline hover:text-blue-600"
                      >
                        APDB
                      </a>.
                    </div>
                    <div>
                      <strong className="font-semibold">Organisms:</strong> Organisms are sourced from the Kraken index used to generate the panels. You can find more details at the {" "}
                      <a
                        href={KRAKEN_INDEX_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline hover:text-blue-600"
                      >
                        Kraken Index
                      </a>.
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </FormLabel>

          <FormDescription>
            Screen individual pathogens or choose from a pre-selected panel of pathogens.
          </FormDescription>

          <div className="flex items-center space-x-2">
            <FormSwitch name="toggleDetected" id="toggleDetected" />
            <FormLabel htmlFor="toggleDetected">Only detected</FormLabel>
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
            Choose a minimum inclusive threshold for pathogen detection.
          </FormDescription>
          <div className="flex items-center space-x-2">
            <FormInput name="numericalThreshold" label="Num (#)" type="number" inputMode="numeric" min={0} step="1" />
            <FormInput name="percentThreshold" label="Percent (%)" type="number" inputMode="numeric" min={0} max={100} step="0.01" />
          </div>
        </div>

        <SidebarSeparator className="my-4" />
      </SidebarContent>
    </Sidebar>
  );
};

// Memoize to avoid unnecessary re-renders
const SideBarForm = React.memo(SideBarFormComponent);
export default SideBarForm;
export { SideBarForm };
