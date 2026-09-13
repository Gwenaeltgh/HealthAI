export const safeGet = <T>(obj: Record<string, any>, path: string, defaultValue: T): T => {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }

    return result !== undefined ? result : defaultValue;
};

export const safeParseJSON = (jsonString: string, defaultValue: any = null): any => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return defaultValue;
    }
};