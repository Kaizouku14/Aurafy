"use client";

import { useCallback, useState } from "react";

export const useConfirmDelete = () => {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const openConfirm = useCallback((id: string) => {
    setPendingId(id);
  }, []);

  const closeConfirm = useCallback(() => {
    setPendingId(null);
  }, []);

  return {
    pendingId,
    isOpen: pendingId !== null,
    openConfirm,
    closeConfirm,
  };
};
