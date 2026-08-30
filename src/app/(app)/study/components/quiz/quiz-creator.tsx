"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import {
  createQuizSchema,
  QUIZ_TYPES,
  type CreateQuizInput,
} from "@/types/quiz/schema";
import { quizTypeLabel } from "@/types/quiz";

const calculateMaxQuestions = (contentLength: number): number => {
  if (contentLength < 1000) return 5;
  if (contentLength < 2000) return 10;
  if (contentLength < 5000) return 20;
  if (contentLength < 8000) return 30;
  return 40;
};

export const QuizCreator = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [maxQuestions, setMaxQuestions] = useState(40);
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<CreateQuizInput>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      subject: "",
      numberOfQuestions: "10",
      quizType: "multiple_choice",
    },
  });

  const handleFile = (picked: File | undefined) => {
    if (!picked) return;

    if (picked.size > 5 * 1024 * 1024) {
      setUploadError("File exceeds the 5MB maximum size limit.");
      setFile(null);
      return;
    }

    if (picked.type !== "application/pdf") {
      setUploadError("Please upload a valid PDF file.");
      setFile(null);
      return;
    }

    // Estimate max questions based on file size (rough estimate: ~1 char per byte for text)
    const estimatedContentLength = picked.size * 0.5; // Conservative estimate
    const calculatedMax = calculateMaxQuestions(estimatedContentLength);
    setMaxQuestions(calculatedMax);

    setFile(picked);
    setUploadError("");
  };

  const onSubmit = async (data: CreateQuizInput) => {
    setUploadError("");

    if (!file) {
      setUploadError("Please upload a PDF to generate a quiz.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject", data.subject);
      formData.append("quizType", data.quizType);
      formData.append("questionCount", data.numberOfQuestions);
      formData.append("generatedAt", format(new Date(), "yyyy-MM-dd"));

      const response = await fetch("/api/quiz/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to generate quiz.");
      }

      void utils.quiz.getQuizSets.invalidate();
      setOpen(false);
      setFile(null);
      form.reset();
      router.refresh();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`border-border gap-2 border-2 px-4 py-2 font-bold ${className ?? ""}`}
        >
          <Plus className="size-4" /> New Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-secondary-background border-4 p-6 sm:max-w-140">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-black tracking-widest uppercase">
            Create Quiz
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <div className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                      Subject
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Pathophysiology Unit 3"
                        className="border-border bg-background text-foreground border-2 font-bold md:w-90"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                 control={form.control}
                 name="numberOfQuestions"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                       No. of Questions
                     </FormLabel>

                     <FormControl>
                       <Select
                         value={field.value}
                         onValueChange={field.onChange}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="No. of Questions" />
                         </SelectTrigger>

                         <SelectContent>
                           <SelectGroup>
                             <SelectLabel>No. of Questions</SelectLabel>
                             {maxQuestions >= 5 && (
                               <SelectItem value="5">5</SelectItem>
                             )}
                             {maxQuestions >= 10 && (
                               <SelectItem value="10">10</SelectItem>
                             )}
                             {maxQuestions >= 20 && (
                               <SelectItem value="20">20</SelectItem>
                             )}
                             {maxQuestions >= 30 && (
                               <SelectItem value="30">30</SelectItem>
                             )}
                             {maxQuestions >= 40 && (
                               <SelectItem value="40">40</SelectItem>
                             )}
                           </SelectGroup>
                         </SelectContent>
                       </Select>
                     </FormControl>

                     {file && maxQuestions < 40 && (
                       <p className="text-muted-foreground text-xs mt-1">
                         Max: {maxQuestions} questions based on content
                       </p>
                     )}

                     <FormMessage />
                   </FormItem>
                 )}
               />
            </div>

            <FormField
              control={form.control}
              name="quizType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Quiz Type
                  </FormLabel>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {QUIZ_TYPES.map((type) => {
                      const selected = field.value === type;

                      return (
                        <Button
                          key={type}
                          type="button"
                          variant={selected ? "default" : "neutral"}
                          className="h-auto px-3 py-2 text-xs font-bold"
                          onClick={() => field.onChange(type)}
                        >
                          {quizTypeLabel[type]}
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                PDF Source
              </FormLabel>
              <div className="rounded-base border-border bg-background/60 relative border-2 border-dashed p-4 text-center">
                <Input
                  type="file"
                  accept="application/pdf"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <p className="text-foreground text-sm font-bold">
                  {file
                    ? `Selected: ${file.name}`
                    : "Click to upload a PDF (max 5MB)"}
                </p>
              </div>
            </div>

            {uploadError && (
              <div className="rounded-base border-destructive bg-destructive/10 border-2 p-3">
                <p className="text-destructive text-center text-sm font-bold">
                  {uploadError}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading}
              className="bg-foreground text-background hover:bg-main hover:text-main-foreground w-full border-4 border-transparent font-black tracking-widest uppercase"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Generating Quiz...
                </span>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
