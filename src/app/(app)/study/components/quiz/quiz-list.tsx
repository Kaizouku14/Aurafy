"use client";

import React from "react";
import { api } from "@/trpc/react";
import { StaggerList } from "@/components/animation/stagger-list";
import { ListSection } from "../shared/list-section";
import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog";
import { useConfirmDelete } from "../shared/use-confirm-delete";
import { QuizCreator } from "./quiz-creator";
import { sileo } from "sileo";
import { QuizCard } from "./components/quiz-card";
import { QuizEmptyState } from "./components/quiz-empty-state";
import type { QuizType } from "@/types/quiz/schema";

export const QuizList = ({
  onSelectQuiz,
}: {
  onSelectQuiz: (quizSetId: string) => void;
}) => {
  const { data: quizSets, isLoading } = api.quiz.getQuizSets.useQuery();
  const utils = api.useUtils();
  const { pendingId, isOpen, openConfirm, closeConfirm } = useConfirmDelete();

  const deleteQuizSet = api.quiz.deleteQuizSet.useMutation({
    onSuccess: () => {
      void utils.quiz.getQuizSets.invalidate();
    },
    onError: () => {
      sileo.error({
        title: "Failed to delete quiz",
        description: "Please try again.",
      });
    },
  });

  const pendingQuiz = quizSets?.find((quiz) => quiz.id === pendingId) ?? null;

  const confirmDelete = async () => {
    if (!pendingId || deleteQuizSet.isPending) return;

    try {
      await deleteQuizSet.mutateAsync({ quizSetId: pendingId });
      closeConfirm();
    } catch {
      // handled by mutation
    }
  };

  return (
    <>
      <ListSection
        title="Quizzes"
        description="Generate hard quizzes from your PDFs and test mastery."
        action={<QuizCreator />}
        isLoading={isLoading}
        loadingLabel="Loading quizzes..."
        isEmpty={!quizSets || quizSets.length === 0}
        emptyState={<QuizEmptyState />}
      >
        <StaggerList
          className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3"
          itemDistance={20}
          staggerDelay={0.08}
        >
          {quizSets?.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={{
                id: quiz.id,
                subject: quiz.subject,
                quizType: quiz.quizType as QuizType,
              }}
              isDeleting={deleteQuizSet.isPending}
              onDelete={openConfirm}
              onSelect={onSelectQuiz}
            />
          ))}
        </StaggerList>
      </ListSection>

      <ConfirmDeleteDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !deleteQuizSet.isPending) closeConfirm();
        }}
        title="Delete quiz?"
        message={
          pendingQuiz
            ? `This will permanently delete "${pendingQuiz.subject}".`
            : "This will permanently delete this quiz."
        }
        isPending={deleteQuizSet.isPending}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </>
  );
};
