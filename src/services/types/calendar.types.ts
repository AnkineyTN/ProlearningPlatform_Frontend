export type CalendarStatus = {
  connected: boolean;
  syncEnabled: boolean;
};

export type CalendarStatusResponse = {
  status: number;
  message: string;
  data: CalendarStatus;
  pagination: null;
};

export type CalendarAuthUrlResponse = {
  status: number;
  message: string;
  data: {
    authorizationUrl: string;
  };
  pagination: null;
};

export type CalendarSettingsRequest = {
  syncEnabled: boolean;
};

export type CalendarGenericResponse = {
  status: number;
  message: string;
  data: null;
  pagination: null;
};
