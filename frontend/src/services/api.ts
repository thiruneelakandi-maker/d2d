import axios from 'axios';
import {
  EmergencyAIResponse,
  EmergencyContact,
  EmergencyFacility,
  EmergencyRequest,
  PersonalICEContact,
  User,
  WeatherData,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('emergency_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login/', { email, password });
    if (res.data.access) {
      localStorage.setItem('emergency_token', res.data.access);
      localStorage.setItem('emergency_refresh', res.data.refresh);
      localStorage.setItem('emergency_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.post('/auth/register/', payload);
    if (res.data.access) {
      localStorage.setItem('emergency_token', res.data.access);
      localStorage.setItem('emergency_refresh', res.data.refresh);
      localStorage.setItem('emergency_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me/');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('emergency_token');
    localStorage.removeItem('emergency_refresh');
    localStorage.removeItem('emergency_user');
  },
};

export const emergencyAPI = {
  analyze: async (description: string, category?: string): Promise<EmergencyAIResponse> => {
    const res = await api.post('/emergencies/analyze/', { message: description, language: 'en' });
    return res.data;
  },
  create: async (data: {
    description: string;
    category?: string;
    latitude?: number | null;
    longitude?: number | null;
    ai_response?: EmergencyAIResponse;
  }): Promise<EmergencyRequest> => {
    const res = await api.post('/emergencies/create/', data);
    return res.data;
  },
  getHistory: async (): Promise<EmergencyRequest[]> => {
    const res = await api.get('/emergencies/history/');
    return res.data;
  },
  getById: async (id: string): Promise<EmergencyRequest> => {
    const res = await api.get(`/emergencies/${id}/`);
    return res.data;
  },
  updateStatus: async (id: string, status: string): Promise<EmergencyRequest> => {
    const res = await api.patch(`/emergencies/${id}/`, { status });
    return res.data;
  },
};

export const contactsAPI = {
  getContacts: async (region = '', service = ''): Promise<{ success: boolean; contacts: EmergencyContact[] }> => {
    const res = await api.get('/emergency-contacts/', {
      params: { region, service },
    });
    return res.data;
  },
  getPersonalICE: async (): Promise<PersonalICEContact[]> => {
    const res = await api.get('/emergency-contacts/personal/');
    return res.data;
  },
  addPersonalICE: async (contact: PersonalICEContact): Promise<PersonalICEContact> => {
    const res = await api.post('/emergency-contacts/personal/', contact);
    return res.data;
  },
  deletePersonalICE: async (id: number): Promise<void> => {
    await api.delete(`/emergency-contacts/personal/${id}/`);
  },
};

export const resourcesAPI = {
  getNearby: async (lat?: number | null, lng?: number | null, type?: string): Promise<{
    count: number;
    results: EmergencyFacility[];
  }> => {
    const payload: any = { latitude: lat, longitude: lng };
    if (type) payload.facility_type = type;
    const res = await api.post('/location/nearby/', payload);
    return res.data;
  },
};

export const aiAPI = {
  chat: async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: any
  ): Promise<{ reply: string }> => {
    const res = await api.post('/ai/chat/', { messages, context });
    return res.data;
  },
};

export const servicesAPI = {
  getWeather: async (lat?: number | null, lng?: number | null): Promise<WeatherData> => {
    const res = await api.get('/weather/', {
      params: { lat, lng },
    });
    return res.data;
  },
  translate: async (text: string, target_language: string): Promise<{ translated_text: string }> => {
    const res = await api.post('/translate/', { text, target_language });
    return res.data;
  },
};
