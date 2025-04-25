"use client"

import * as React from "react"

import {
    Sidebar,
    SidebarContent,
} from "@/components/ui/sidebar"


export function SideBarForm({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            className="top-[var(--header-height)]"
            {...props}
        >

            <SidebarContent className="flex flex-col gap-4 p-4">
                Source(s)
                Select the files you want to analyze.
                Selected Files

                Pathogen(s)
                Screen individual pathogens or choose from a pre-selected panel.
                Selected Panel
                Selected Pathogen
            </SidebarContent>

        </Sidebar>
    )
}
