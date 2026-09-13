import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '../api/settingsApi';
import { Settings } from '../types';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<Settings, Error>({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const mutation = useMutation<Settings, Error, Settings>({
    mutationFn: updateSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
    },
  });

  return {
    settings: data ?? null,
    updateSettings: mutation.mutateAsync,
    isLoading,
    isUpdating: mutation.isLoading,
    error: error?.message ?? null,
  };
};

export default useSettings;