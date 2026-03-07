"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { Plus, Loader2, CalendarIcon, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreatePlanSchema, type CreatePlanInput } from "@/types/schema/planner";
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

export const PlanCreator = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const form = useForm<CreatePlanInput>({
    resolver: zodResolver(CreatePlanSchema),
    defaultValues: {
      title: "",
      hoursPerDay: 4,
      subjects: [{ name: "", examDate: undefined as unknown as Date }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const generatePlan = api.planner.generatePlan.useMutation({
    onSuccess: () => {
      void utils.planner.getPlans.invalidate();
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: CreatePlanInput) => {
    generatePlan.mutate({
      title: data.title,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
      hoursPerDay: data.hoursPerDay,
      subjects: data.subjects.map((s) => ({
        name: s.name,
        examDate: format(s.examDate, "yyyy-MM-dd"),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`border-2 border-border gap-2 font-bold px-4 py-2 ${className ?? ""}`}>
          <Plus className="size-4" /> New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] border-4 border-border p-6 bg-secondary-background max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-widest text-foreground">Generate Study Plan</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Finals Week Prep"
                      className="border-2 border-border focus-visible:ring-offset-0 focus-visible:ring-main bg-background text-foreground font-bold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="noShadow"
                            className={cn(
                              "w-full justify-start text-left font-bold border-2 border-border bg-background text-foreground h-10",
                              !field.value && "text-muted-foreground font-normal bg-background/50"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="noShadow"
                            className={cn(
                              "w-full justify-start text-left font-bold border-2 border-border bg-background text-foreground h-10",
                              !field.value && "text-muted-foreground font-normal bg-background/50"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hoursPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hours Per Day</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={16}
                      className="border-2 border-border focus-visible:ring-offset-0 focus-visible:ring-main bg-background text-foreground font-bold w-24"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subjects & Exam Dates</FormLabel>
                <Button
                  type="button"
                  variant="noShadow"
                  className="text-xs border-2 border-border px-3 py-1 h-auto font-bold"
                  onClick={() => append({ name: "", examDate: undefined as unknown as Date })}
                >
                  <Plus className="size-3 mr-1" /> Add
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 border-2 border-border rounded-base p-3 sm:p-0 sm:border-0">
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Subject name"
                            className="border-2 border-border bg-background text-foreground font-bold"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.examDate`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="noShadow"
                                  className={cn(
                                    "justify-start text-left font-bold border-2 border-border bg-background text-foreground h-10 w-full",
                                    !field.value && "text-muted-foreground font-normal bg-background/50"
                                  )}
                                >
                                  <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                                  {field.value ? format(field.value, "MMM dd") : "Exam date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="noShadow"
                        size="icon"
                        className="border-2 border-transparent text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {generatePlan.isError && (
              <div className="p-3 border-2 border-destructive bg-destructive/10 rounded-base">
                <p className="text-destructive text-sm font-bold text-center">{generatePlan.error.message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={generatePlan.isPending}
              className="w-full mt-4 bg-foreground text-background font-black uppercase tracking-widest text-lg p-4 rounded-base border-4 border-transparent hover:bg-main hover:text-main-foreground transition-colors duration-200 h-10"
            >
              {generatePlan.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin size-5" /> Generating Plan...</span>
              ) : "Generate Plan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
