"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { Plus, Loader2, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDeckSchema, type CreateDeckInput } from "@/types/schema/flashcard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

export const DeckCreator = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const utils = api.useUtils();
  const router = useRouter();

  const form = useForm<CreateDeckInput>({
    resolver: zodResolver(CreateDeckSchema),
    defaultValues: {
      subject: "",
      notes: "",
    },
  });

  const createDeck = api.flashcard.createDeck.useMutation({
    onSuccess: () => {
      utils.flashcard.getDecks.invalidate();
      setOpen(false);
      form.reset();
      setFile(null);
    }
  });

  const onSubmit = async (data: CreateDeckInput) => {
    setUploadError("");

    if (!data.notes && !file) {
      setUploadError("You must provide either text notes or upload a PDF document.");
      return;
    }

    const dateStr = format(data.examDate, "yyyy-MM-dd");

    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject", data.subject);
        formData.append("examDate", dateStr);
        if (data.notes) {
           formData.append("notes", data.notes);
        }

        const res = await fetch("/api/flashcard/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to parse PDF and generate deck");
        }

        utils.flashcard.getDecks.invalidate();
        setOpen(false);
        form.reset();
        setFile(null);
        router.refresh();
      } catch (err: any) {
        setUploadError(err.message || "An unexpected error occurred during file upload.");
      } finally {
        setIsUploading(false);
      }
    } else {
      createDeck.mutate({ subject: data.subject, examDate: dateStr, notes: data.notes || "" });
    }
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      setUploadError("File exceeds the 5MB maximum size limit.");
      setFile(null);
      return;
    }

    if (f.type === "application/pdf") {
      setFile(f);
      setUploadError("");
    } else {
      setUploadError("Please upload a valid PDF file.");
      setFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
      e.dataTransfer.clearData();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`border-2 border-border gap-2 font-bold px-4 py-2 ${className || ""}`}>
          <Plus className="size-4" /> New Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] border-4 border-border p-6 bg-secondary-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-widest text-foreground">Create Flashcard Deck</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Cognitive Psychology Ch 4"
                      className="border-2 border-border focus-visible:ring-offset-0 focus-visible:ring-main bg-background text-foreground font-bold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="examDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">Exam/Deadline Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"noShadow"}
                          className={cn(
                            "w-full justify-start text-left font-bold border-2 border-border bg-background text-foreground h-10",
                            !field.value && "text-muted-foreground font-normal bg-background/50"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-2">
              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Source Material</FormLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Paste notes here..."
                          className="w-full h-full min-h-[150px] p-3 border-2 border-border rounded-base focus:outline-none focus:ring-2 focus:ring-main bg-background text-foreground resize-none font-base text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed border-border rounded-base bg-background/50 transition-all p-4 relative h-full min-h-[150px]",
                    isDragging ? "bg-main/20 border-main scale-[1.02]" : "hover:bg-background"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                   <Input
                     id="pdf-upload"
                     type="file"
                     accept="application/pdf"
                     className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                     onChange={(e) => {
                       const f = e.target.files?.[0];
                       handleFile(f);
                       e.target.value = "";
                     }}
                   />
                   <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none text-center">
                     <div className={cn(
                       "p-3 rounded-full shadow-shadow border-2 border-border transition-colors",
                       isDragging ? "bg-background text-foreground" : "bg-main text-main-foreground"
                     )}>
                       <Plus className="size-6" />
                     </div>
                     {file ? (
                        <p className="text-sm font-bold text-foreground">Selected: {file.name}</p>
                     ) : (
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {isDragging ? "Drop PDF here" : "Upload PDF"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Or drag & drop (Max 5MB)</p>
                        </div>
                     )}
                   </div>
                </div>
              </div>
            </div>

            {(createDeck.isError || uploadError) && (
              <div className="p-3 border-2 border-destructive bg-destructive/10 rounded-base">
                <p className="text-destructive text-sm font-bold text-center">
                  {uploadError || createDeck.error?.message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={createDeck.isPending || isUploading}
              className="w-full mt-4 bg-foreground text-background font-black uppercase tracking-widest text-lg p-4 rounded-base border-4 border-transparent hover:bg-main hover:text-main-foreground transition-colors duration-200 h-10"
            >
              {(createDeck.isPending || isUploading) ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin size-5" /> Generating Cards...</span>
              ) : "Generate Cards"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
