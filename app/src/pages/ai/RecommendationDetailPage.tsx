import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecommendation } from '../../features/recommendations/hooks/useRecommendation';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../features/auth/hooks/useAuth';

const RecommendationDetailPage = () => {
    const { recommendationId } = useParams<{ recommendationId: string }>();
    const { recommendation, isLoading, error } = useRecommendation(recommendationId);
    const { user } = useAuth();
    const isEnterprise = user?.role === 'enterprise';

    if (isLoading) {
        return <Skeleton height="120px" />;
    }

    if (error) {
        return <div>Erreur lors du chargement de la recommandation: {error.message}</div>;
    }

    if (!recommendation) {
        return <div>Recommendation not found.</div>;
    }

    const createdAt = recommendation.createdAt ? new Date(recommendation.createdAt) : null;
    const confidence = recommendation.confidenceLevel;
    const confidenceText = (() => {
        if (typeof confidence !== 'number' || !Number.isFinite(confidence)) return 'Non disponible';
        if (confidence <= 1) return `${(confidence * 100).toFixed(1)}%`;
        if (confidence <= 100) return `${confidence.toFixed(1)}%`;
        return String(confidence);
    })();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{isEnterprise ? 'Détails de la recommandation entreprise' : 'Détails de la recommandation'}</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold">{recommendation.type}</h2>
                <p className="mt-2">{recommendation.details}</p>
                <div className="mt-4">
                    <h3 className="font-semibold">Détails supplémentaires:</h3>
                    <ul className="list-disc list-inside">
                        <li>Utilisateur: {recommendation.userId}</li>
                        <li>Date: {createdAt ? createdAt.toLocaleString() : '—'}</li>
                        <li>Niveau de confiance: {confidenceText}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RecommendationDetailPage;