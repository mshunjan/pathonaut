'use client'
import { ReactNode, useEffect } from "react";
import { DuckDBConfig } from "@duckdb/duckdb-wasm";
import { initializeDuckDb } from "duckdb-wasm-kit";

interface DuckDbProviderProps {
    children: ReactNode;
}

const DuckdbProvider = ({ children }: DuckDbProviderProps) => {
    useEffect(() => {
        const config: DuckDBConfig = {
            query: {
                castBigIntToDouble: true,
            },
        }
        initializeDuckDb({ config, debug: true });
    }, []);

    return (
        <>
            {children}
        </>
    )
}

export default DuckdbProvider;
