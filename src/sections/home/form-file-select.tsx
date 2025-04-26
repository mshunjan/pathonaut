import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import React from "react";
import { Meteors } from "@/components/ui/meteors";
import { motion } from "motion/react";
import { Scroller } from "@/components/ui/scroller";
import { Button } from "@/components/ui/button";


type FormFileSelectProps = React.ComponentPropsWithoutRef<typeof FileUpload> & {
    name: string;
}

const mainVariant = {
    initial: {
        x: 0,
        y: 0,
    },
    animate: {
        x: 20,
        y: -20,
        opacity: 0.9,
    },
};

const secondaryVariant = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
};


export default function FormFileSelect({ name, ...props }: FormFileSelectProps) {
    const { control, setError } = useFormContext();
    const animatedHeader = React.useMemo(() => (
        <TextAnimate delay={1} animation="blurInUp" by="character" once className="font-medium text-sm mt-4">
            Drag & drop your file(s) here
        </TextAnimate>
    ), []);

    const animatedCaption = React.useMemo(() => (
        <div className="flex flex-col items-center gap-2">
            <TextAnimate delay={2} animation="blurInUp" by="character" once className="text-xs text-muted-foreground">
                Or click to browse.
            </TextAnimate>
            <TextAnimate delay={2} animation="blurInUp" by="character" once className="text-xs text-muted-foreground">
                Supported formats: CSV, TSV
            </TextAnimate>
        </div>
    ), []);

    const meteors = React.useMemo(() => (
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
            <Meteors number={20} />
        </div>
    ), [])

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <FileUpload
                            value={field.value}
                            onValueChange={field.onChange}
                            accept=".csv, .tsv"
                            onFileReject={(_, message) => {
                                setError("files", {
                                    message,
                                });
                            }}
                            multiple
                            {...props}
                        >
                            <FileUploadDropzone className="w-full flex-col justify-between gap-10 hover:bg-transparent max-w-md">
                                {meteors}
                                {animatedHeader}

                                {/* animated wrapper */}
                                <div className="relative w-full ">
                                    <motion.div
                                        whileHover="animate"
                                    >

                                        {/* the “card” shadowed hover effect */}
                                        <motion.div
                                            layoutId="file-upload"
                                            variants={mainVariant}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 w-full max-w-[8rem] mx-auto rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                                        >
                                            <Upload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                                        </motion.div>

                                        {/* dashed overlay on hover */}
                                        <motion.div
                                            variants={secondaryVariant}
                                            className="absolute opacity-0 border border-dashed border-accent inset-0 z-30 bg-transparent flex items-center justify-center w-full max-w-[8rem] mx-auto rounded-md"
                                        />
                                    </motion.div>
                                </div>

                                {animatedCaption}
                            </FileUploadDropzone>

                            <div className="flex items-center justify-center w-full max-w-md flex-col">
                                <Scroller className="flex w-full flex-col p-4 max-h-80 " hideScrollbar>
                                    <FileUploadList>
                                        {field.value.map((file: File, index: React.Key | null | undefined) => (
                                            <FileUploadItem key={index} value={file}>
                                                <FileUploadItemPreview />
                                                <FileUploadItemMetadata />
                                                <FileUploadItemDelete asChild>
                                                    <Button variant="ghost" size="icon" className="size-7">
                                                        <X />
                                                    </Button>
                                                </FileUploadItemDelete>
                                            </FileUploadItem>
                                        ))}
                                    </FileUploadList>
                                </Scroller>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: field.value.length > 0 ? 1 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full"
                                >
                                    <Button type="submit" className="w-full" disabled={field.value.length === 0}>
                                        Next step
                                    </Button>
                                </motion.div>
                            </div>
                        </FileUpload>
                    </FormControl>
                </FormItem>
            )}
        />
    )
}