export interface Recommendation {
  id: string;
  userId: string;
  type: 'diet' | 'exercise' | 'nutrition' | 'training' | 'health' | 'recovery' | string;
  details: string;
  confidenceLevel?: number;
  userName?: string;
  enterpriseId?: string;
  enterpriseName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  total: number;
}

export interface RecommendationDetail {
  recommendation: Recommendation;
  explanation: string;
  userFeedback?: string;
}