import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';

type LoginArgs = { email: string; password: string; mode: 'admin' | 'enterprise' | 'user' };

export const useLogin = () => {
  const { loginAdmin, loginEnterprise } = useAuth();

  const mutation = useMutation<void, Error, LoginArgs>({
    mutationFn: async ({ email, password, mode }) => {
      if (mode === 'admin') {
        await loginAdmin(email, password);
        return;
      }
      if (mode === 'enterprise') {
        await loginEnterprise(email, password);
        return;
      }
      throw new Error('Connexion utilisateur non branchée (backend manquant)');
    },
  });

  const login = async (email: string, password: string, mode: 'admin' | 'enterprise' | 'user' = 'admin') => {
    await mutation.mutateAsync({ email, password, mode });
  };

  return {
    login,
    error: mutation.error?.message ?? null,
    isLoading: mutation.isPending,
  };
};

export default useLogin;