import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';

type RegisterArgs = { email: string; password: string; mode: 'admin' | 'user' };

export const useRegister = () => {
  const { registerAdmin } = useAuth();

  const mutation = useMutation<void, Error, RegisterArgs>({
    mutationFn: async ({ email, password, mode }) => {
      if (mode === 'admin') {
        await registerAdmin(email, password);
        return;
      }
      throw new Error('Inscription utilisateur non branchée (backend manquant)');
    },
  });

  const register = async (email: string, password: string, mode: 'admin' | 'user' = 'admin') => {
    await mutation.mutateAsync({ email, password, mode });
  };

  return {
    register,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};

export default useRegister;