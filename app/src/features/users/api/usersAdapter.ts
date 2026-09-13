import { User } from '../types';
import { adaptUtilisateur, UtilisateurApiResponse } from './usersApi';

export const adaptUserResponse = (data: UtilisateurApiResponse): User => {
    return adaptUtilisateur(data);
};

export const adaptUserListResponse = (data: UtilisateurApiResponse[]): User[] => {
    return data.map(adaptUserResponse);
};