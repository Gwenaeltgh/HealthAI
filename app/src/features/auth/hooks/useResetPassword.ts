import { useMutation } from '@tanstack/react-query';

type ResetPasswordPayload = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export const useResetPassword = () => {
  const mutation = useMutation<void, Error, ResetPasswordPayload>({
    mutationFn: async (payload) => {
      if (!payload.token.trim()) throw new Error('Token requis');
      if (payload.newPassword.length < 8) throw new Error('Mot de passe minimum 8 caractères');
      if (payload.newPassword !== payload.confirmPassword) throw new Error('Les mots de passe ne correspondent pas');
      await new Promise((r) => setTimeout(r, 600));
    },
  });

  const reset = async (payload: ResetPasswordPayload) => {
    await mutation.mutateAsync(payload);
  };

  return {
    reset,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    success: mutation.isSuccess,
  };
};

export default useResetPassword;