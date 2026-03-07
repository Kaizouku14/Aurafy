import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import {
  createNote,
  getUserNotes,
  getNoteById,
  updateNoteContent,
  deleteNoteById,
} from "@/lib/api/notes/queries";

export const notesRouter = createTRPCRouter({
  createNote: protectedProcedure
    .input(z.object({ subject: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const noteId = nanoid();
      await createNote(noteId, ctx.session.user.id, input.subject);
      return { noteId };
    }),

  getNotes: protectedProcedure.query(async ({ ctx }) => {
    return getUserNotes(ctx.session.user.id);
  }),

  getNote: protectedProcedure
    .input(z.object({ noteId: z.string() }))
    .query(async ({ ctx, input }) => {
      const note = await getNoteById(input.noteId, ctx.session.user.id);

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
      }

      return note;
    }),

  updateNote: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
        cues: z.string(),
        notes: z.string(),
        summary: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const note = await getNoteById(input.noteId, ctx.session.user.id);

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
      }

      await updateNoteContent(input.noteId, input.cues, input.notes, input.summary);
      return { success: true };
    }),

  deleteNote: protectedProcedure
    .input(z.object({ noteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await getNoteById(input.noteId, ctx.session.user.id);

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
      }

      await deleteNoteById(input.noteId);
      return { success: true };
    }),
});
