export interface Exercise {
  id: string;
  name: string;
  equipment: string | null;
  bodyPart: string | null;
  exerciseType: string | null;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface SportData {
  exercises: Exercise[];
  programs: Program[];
}