import { useState, useCallback } from 'react';
import * as api from '../services/adminApi.js';

export default function useImpersonation() {
  const [impersonating, setImpersonating] = useState(null);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const startImpersonation = (user) => {
    setPendingUser(user);
    setShowReasonPrompt(true);
  };

  const confirmImpersonation = useCallback(async (reason) => {
    if (!pendingUser) return;
    try {
      await api.impersonateUser(pendingUser.id, reason);
      setImpersonating(pendingUser);
    } catch (err) {
      console.error('Impersonation failed:', err);
    }
    setShowReasonPrompt(false);
    setPendingUser(null);
  }, [pendingUser]);

  const exitImpersonation = useCallback(() => {
    setImpersonating(null);
  }, []);

  const cancelImpersonation = useCallback(() => {
    setShowReasonPrompt(false);
    setPendingUser(null);
  }, []);

  return {
    impersonating,
    showReasonPrompt,
    pendingUser,
    startImpersonation,
    confirmImpersonation,
    exitImpersonation,
    cancelImpersonation,
  };
}
