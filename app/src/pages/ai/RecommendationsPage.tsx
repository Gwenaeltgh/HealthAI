import React from 'react';
import { useRecommendations } from '../../features/recommendations/hooks/useRecommendations';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { paths } from '../../routes/paths';
import Badge from '../../components/ui/Badge';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';
import { generateRecommendationsForAllUsers } from '../../features/recommendations/api/recommendationsApi';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const RecommendationsPage: React.FC = () => {
    const location = useLocation();
    const [typeFilter, setTypeFilter] = React.useState<'all' | 'diet' | 'exercise' | 'nutrition'>('all');
    const [query, setQuery] = React.useState('');
    const [periodDays, setPeriodDays] = React.useState('');

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') ?? '';
        setQuery(q);
    }, [location.search]);

    const { recommendations, isLoading, error, refetch, isFetching } = useRecommendations({
        type: typeFilter === 'all' ? undefined : typeFilter,
        q: query.trim() ? query.trim() : undefined,
        periodDays: periodDays ? Number(periodDays) : undefined,
    });
    const { user } = useAuth();
    const isEnterprise = user?.role === 'enterprise';
    const [isGeneratingAll, setIsGeneratingAll] = React.useState(false);
    const [generationMessage, setGenerationMessage] = React.useState<string | null>(null);
    const [generationError, setGenerationError] = React.useState<string | null>(null);

    const onGenerateForAllUsers = async () => {
        setIsGeneratingAll(true);
        setGenerationError(null);
        setGenerationMessage(null);
        try {
            const result = await generateRecommendationsForAllUsers({ kind: 'all' });
            const errorsCount = Array.isArray(result.errors) ? result.errors.length : 0;
            const parts = [
                `Génération terminée: ${result.createdCount} recos créées pour ${result.usersCount} utilisateurs.`,
                result.skippedCount ? `${result.skippedCount} ignorées.` : null,
                errorsCount ? `${errorsCount} erreurs.` : null,
            ].filter(Boolean);
            setGenerationMessage(parts.join(' '));
            await refetch();
        } catch (err: any) {
            const msg = String(err?.response?.data?.error ?? err?.message ?? 'Erreur lors de la génération.');
            setGenerationError(msg);
        } finally {
            setIsGeneratingAll(false);
        }
    };
    const recommendationPath = (recommendationId: string) =>
        isEnterprise ? paths.enterprise.recommendationDetail(recommendationId) : paths.recommendations.detail(recommendationId);

    const typeChips: Array<{ key: 'all' | 'diet' | 'exercise' | 'nutrition'; label: string }> = [
        { key: 'all', label: 'Toutes' },
        { key: 'diet', label: 'Diet' },
        { key: 'exercise', label: 'Sport' },
        { key: 'nutrition', label: 'Nutrition' },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4">
                <Skeleton height="160px" />
                <Skeleton height="160px" />
                <Skeleton height="160px" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Erreur de chargement des recommandations.</div>;
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">Recommandations IA</div>
                    <div className="page-subtitle">
                        {isEnterprise ? 'Priorités opérationnelles du compte et actions à fort impact' : 'Recommandations, priorisation et détails'}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="tertiary"
                        size="small"
                        onClick={onGenerateForAllUsers}
                        disabled={isGeneratingAll || isFetching}
                    >
                        {isGeneratingAll ? 'Génération…' : 'Générer pour tous les utilisateurs'}
                    </Button>
                    <Badge text={isEnterprise ? 'Compte isolé' : 'Standard'} color="info" />
                    <Badge text={`${recommendations.length} recos`} color="success" />
                </div>
            </div>

            {generationError ? <div className="mt-2 text-sm text-red-600">{generationError}</div> : null}
            {generationMessage ? <div className="mt-2 text-sm text-slate-600">{generationMessage}</div> : null}

            <div className="mt-4 surface-solid p-4">
                <SectionHeader title="Portefeuille de recommandations" subtitle={isEnterprise ? 'Actions prioritaires du périmètre' : 'Actions prioritaires'} />

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        {typeChips.map((chip) => (
                            <Button
                                key={chip.key}
                                type="button"
                                size="small"
                                variant={typeFilter === chip.key ? 'secondary' : 'tertiary'}
                                onClick={() => setTypeFilter(chip.key)}
                            >
                                {chip.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                        <div className="w-full md:w-72">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={isEnterprise ? 'Rechercher…' : 'Rechercher (id, nom, entreprise…)'}
                            />
                        </div>
                        <Select
                            value={periodDays}
                            onChange={setPeriodDays}
                            placeholder="Période"
                            options={[
                                { value: '7', label: '7 derniers jours' },
                                { value: '30', label: '30 derniers jours' },
                            ]}
                            className="w-full md:w-52"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((r) => (
                    <Card key={r.id} title={r.type}>
                        <div className="text-slate-800">
                            <div className="text-sm text-slate-600">
                                {isEnterprise ? (
                                    <>Compte: {user?.companyName ?? 'entreprise'}</>
                                ) : (
                                    <>
                                        Utilisateur: {r.userName ? `${r.userName} (#${r.userId})` : `#${r.userId}`}
                                        {r.enterpriseName ? ` • Entreprise: ${r.enterpriseName}` : ''}
                                    </>
                                )}
                            </div>
                            <div className="mt-2 text-sm leading-6">{r.details}</div>
                            <div className="mt-3">
                                <Link to={recommendationPath(r.id)} className="text-blue-600 hover:underline">
                                    Voir détails
                                </Link>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RecommendationsPage;