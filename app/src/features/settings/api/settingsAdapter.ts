import { Settings } from '../types';
import { fetchSettings } from './settingsApi';

export const adaptSettingsResponse = async (): Promise<Settings> => {
    const response = await fetchSettings();
    
    // Assuming the response needs to be adapted to fit the SettingsResponse type
    return response;
};