// This file contains utility functions for formatting data.

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US').format(new Date(date));
};

export const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
};

export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};