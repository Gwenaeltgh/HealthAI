import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { isOfflineProfile, isPerformanceProfile } from '../../api/env';

const ONE_MINUTE = 60_000;
const ONE_HOUR = 60 * ONE_MINUTE;

const isOffline = isOfflineProfile();
const isPerformance = isPerformanceProfile();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: isOffline ? 0 : 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: isOffline ? 24 * ONE_HOUR : isPerformance ? 5 * ONE_MINUTE : 30_000,
            cacheTime: isOffline ? 24 * ONE_HOUR : isPerformance ? 30 * ONE_MINUTE : 5 * ONE_MINUTE,
        },
        mutations: {
            retry: 0,
        },
    },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryProvider;