import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { Program, Exercise } from '../types';

type ExerciseApiResponse = {
  id: number;
  name: string;
  equipment: string | null;
  body_part: string | null;
  exercise_type: string | null;
};

const adaptExercise = (e: ExerciseApiResponse): Exercise => {
  return {
    id: String(e.id),
    name: e.name,
    equipment: e.equipment,
    bodyPart: e.body_part,
    exerciseType: e.exercise_type,
  };
};

export const fetchSportPrograms = async (): Promise<Program[]> => {
  return apiClient.get<Program[]>(API_ENDPOINTS.sport.programs);
};

export const fetchSportProgramById = async (id: string): Promise<Program> => {
  return apiClient.get<Program>(API_ENDPOINTS.sport.programDetail(id));
};

// Fetch all exercises
export const fetchExercises = async () => {
  const data = await apiClient.get<ExerciseApiResponse[]>(API_ENDPOINTS.sport.exercises);
  return data.map(adaptExercise);
};

// Fetch a specific exercise by ID
export const fetchExerciseById = async (id: string) => {
  const list = await fetchExercises();
  const found = list.find((e) => e.id === id);
  if (!found) {
    throw new Error('Exercice introuvable');
  }
  return found;
};

// Backward-compatible aliases used by hooks/pages
export const fetchPrograms = fetchSportPrograms;
export const fetchProgram = fetchSportProgramById;