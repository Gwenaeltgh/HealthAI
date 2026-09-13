export interface Settings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  language: string;
  privacySettings: {
    dataSharing: boolean;
    personalizedAds: boolean;
  };
}

export interface UpdateSettingsPayload {
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
  language?: string;
  privacySettings?: {
    dataSharing?: boolean;
    personalizedAds?: boolean;
  };
}