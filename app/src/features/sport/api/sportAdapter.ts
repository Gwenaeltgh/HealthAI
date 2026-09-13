import { Program, Exercise } from '../types';
import { fetchPrograms, fetchExercises } from './sportApi';

export const adaptSportPrograms = (data: any): Program[] => {
    return (data ?? []).map((program: any) => ({
        id: String(program.id),
        name: program.name,
        description: program.description ?? program.desc ?? '',
        exercises: adaptSportExercises(program.exercises ?? []),
        duration: program.duration ?? program.length ?? 0,
        level: program.level ?? program.difficulty ?? 'beginner',
    }));
};

export const adaptSportExercises = (data: any): Exercise[] => {
    return data.map((exercise: any) => ({
        id: String(exercise.id),
        name: exercise.name,
        equipment: exercise.equipment ?? null,
        bodyPart: exercise.body_part ?? exercise.bodyPart ?? null,
        exerciseType: exercise.exercise_type ?? exercise.type ?? null,
    }));
};

export const fetchAndAdaptSportPrograms = async () => {
    const list = await fetchPrograms();
    return adaptSportPrograms(list);
};

export const fetchAndAdaptSportExercises = async () => {
    const list = await fetchExercises();
    return adaptSportExercises(list);
};