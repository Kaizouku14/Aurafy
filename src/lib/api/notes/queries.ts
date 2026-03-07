import { db } from "@/server/db";
import { cornellNotes } from "@/server/db/schema/note";
import { eq, and } from "drizzle-orm";

export async function createNote(id: string, userId: string, subject: string) {
  return db.insert(cornellNotes).values({ id, userId, subject });
}

export async function getUserNotes(userId: string) {
  return db.query.cornellNotes.findMany({
    where: eq(cornellNotes.userId, userId),
    orderBy: (notes, { desc }) => [desc(notes.updatedAt)],
  });
}

export async function getNoteById(noteId: string, userId: string) {
  return db.query.cornellNotes.findFirst({
    where: and(eq(cornellNotes.id, noteId), eq(cornellNotes.userId, userId)),
  });
}

export async function updateNoteContent(
  noteId: string,
  cues: string,
  notes: string,
  summary: string
) {
  return db
    .update(cornellNotes)
    .set({ cues, notes, summary, updatedAt: new Date() })
    .where(eq(cornellNotes.id, noteId));
}

export async function deleteNoteById(noteId: string) {
  return db.delete(cornellNotes).where(eq(cornellNotes.id, noteId));
}
