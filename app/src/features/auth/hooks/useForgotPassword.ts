import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../api/client';

export const useForgotPassword = () => {
  const mutation = useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      if (!email.trim()) throw new Error('Email requis');
      await apiClient.post('/api/password/forgot', { email });
    },
  });

  const handleForgotPassword = async (email: string) => {
    await mutation.mutateAsync({ email });
  };

  return {
    handleForgotPassword,
    error: mutation.error?.message ?? null,
    success: mutation.isSuccess,
    isLoading: mutation.isPending,
  };
};

export default useForgotPassword;