'use client'
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle"; 
import * as React from "react"; 
import FileSelectForm from "./file-select-form";

export default function Home() {
  
  return (
    <main className="relative flex min-h-screen flex-col">

      <header className="w-full flex items-center justify-between p-4">
        <Logo full={false} />
        <ThemeToggle />
      </header>
      <div className="flex-1 flex items-center justify-center">
        <FileSelectForm />
      </div>
    </main>
  );
}