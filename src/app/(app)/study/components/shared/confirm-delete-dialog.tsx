"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  isPending?: boolean;
  onConfirm: () => void;
}

export const ConfirmDeleteDialog = ({
  open,
  onOpenChange,
  title = "Delete item?",
  message,
  isPending = false,
  onConfirm,
}: ConfirmDeleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] border-4 border-border p-6 bg-secondary-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-widest uppercase">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm font-base">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="neutral"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="noShadow"
            onClick={onConfirm}
            disabled={isPending}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
