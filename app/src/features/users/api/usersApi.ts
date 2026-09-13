import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { User } from '../types';

export type UtilisateurApiResponse = {
  id: number;
  nom: string;
  age: number;
  gender: string;
  poids: number;
  taille: number;
  disease_type: string | null;
  disease_severity: string | null;
  daily_caloric_intake: number | null;
  adherence_to_diet_plan: number | null;
  physical_activity_level: string | null;
};

export const adaptUtilisateur = (u: UtilisateurApiResponse): User => {
  return {
    id: String(u.id),
    name: u.nom,
    age: u.age,
    gender: u.gender,
    weightKg: u.poids,
    heightCm: u.taille,
    diseaseType: u.disease_type,
    diseaseSeverity: u.disease_severity,
    dailyCaloricIntake: u.daily_caloric_intake,
    adherenceToDietPlan: u.adherence_to_diet_plan,
    physicalActivityLevel: u.physical_activity_level,
  };
};

export const fetchUsers = async (companyId?: string): Promise<User[]> => {
  if (companyId) {
    const data = await apiClient.get<UtilisateurApiResponse[]>(API_ENDPOINTS.enterprise.users.list);
    return data.map(adaptUtilisateur);
  }

  const data = await apiClient.get<UtilisateurApiResponse[]>(API_ENDPOINTS.users.list);
  return data.map(adaptUtilisateur);
};

export const fetchUserById = async (userId: string, companyId?: string): Promise<User> => {
  if (companyId) {
    const data = await apiClient.get<UtilisateurApiResponse>(API_ENDPOINTS.enterprise.users.detail(userId));
    return adaptUtilisateur(data);
  }

  const data = await apiClient.get<UtilisateurApiResponse>(API_ENDPOINTS.users.detail(userId));
  return adaptUtilisateur(data);
};