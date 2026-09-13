export const handleApiError = (error: any) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
            status: error.response.status,
            message: error.response.data.message || 'An error occurred',
        };
    } else if (error.request) {
        // The request was made but no response was received
        return {
            status: 0,
            message: 'No response received from the server',
        };
    } else {
        // Something happened in setting up the request that triggered an Error
        return {
            status: -1,
            message: error.message || 'An unexpected error occurred',
        };
    }
};