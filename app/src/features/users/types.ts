export interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  diseaseType: string | null;
  diseaseSeverity: string | null;
  dailyCaloricIntake: number | null;
  adherenceToDietPlan: number | null;
  physicalActivityLevel: string | null;
}