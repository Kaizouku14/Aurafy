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
import { api } from "@/trpc/react";
import {
  createQuizSchema,
  QUIZ_TYPES,
  type CreateQuizInput,
} from "@/types/quiz/schema";
import { quizTypeLabel } from "./components/quiz-types";

export const QuizCreator = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<CreateQuizInput>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      subject: "",
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
      formData.append("questionCount", "10");
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
        <Button className={`border-2 border-border gap-2 font-bold px-4 py-2 ${className ?? ""}`}>
          <Plus className="size-4" /> New Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] border-4 border-border p-6 bg-secondary-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-widest text-foreground">
            Create Quiz
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subject
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Pathophysiology Unit 3"
                      className="border-2 border-border bg-background text-foreground font-bold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quizType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quiz Type
                  </FormLabel>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                PDF Source
              </FormLabel>
              <div className="relative rounded-base border-2 border-dashed border-border bg-background/60 p-4 text-center">
                <Input
                  type="file"
                  accept="application/pdf"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <p className="text-sm font-bold text-foreground">
                  {file ? `Selected: ${file.name}` : "Click to upload a PDF (max 5MB)"}
                </p>
              </div>
            </div>

            {uploadError && (
              <div className="rounded-base border-2 border-destructive bg-destructive/10 p-3">
                <p className="text-destructive text-sm font-bold text-center">{uploadError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading}
              className="w-full bg-foreground text-background hover:bg-main hover:text-main-foreground border-4 border-transparent font-black uppercase tracking-widest"
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
