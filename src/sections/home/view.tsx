'use client'
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import * as React from "react";
import FileSelectForm from "./file-select-form";
import { TextAnimate } from "@/components/magicui/text-animate";

export default function Home() {

  const welcomeMessage = React.useMemo(() => (
    <TextAnimate animation="blurInUp" by="character" once className="font-medium text-xl mt-4">
      Pathonaut is a pathogen screening tool.
    </TextAnimate>
  ), []);


  return (
    <main className="relative flex min-h-screen flex-col">

      <header className="w-full flex items-center justify-between p-4">
        <Logo full={false} />
        <ThemeToggle />
      </header>
      <div className="flex-1 flex flex-col gap-10 items-center justify-center">
        {welcomeMessage}
        <FileSelectForm />
      </div>
    </main>
  );
}