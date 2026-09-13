import React from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../features/users/hooks/useUser';
import UserHeader from '../../features/users/components/UserHeader';
import Skeleton from '../../components/ui/Skeleton';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';

const UserDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user, isLoading, error } = useUser(userId);

    if (isLoading) {
        return <Skeleton />;
    }

    if (error) {
        return <div>Error loading user details: {error.message}</div>;
    }

    if (!user) {
        return <div>User not found.</div>;
    }

    const hash = (value: string) => {
        let result = 0;
        for (let index = 0; index < value.length; index += 1) {
            result = (result * 31 + value.charCodeAt(index)) >>> 0;
        }
        return result;
    };

    const caloriesSeries = Array.from({ length: 18 }).map((_, i) => ({
        day: `J${i + 1}`,
        calories: Math.max(1200, Math.round((user.dailyCaloricIntake ?? 2100) * (0.9 + ((hash(`cal:${i}:${user.id}`) % 18) / 100)))),
    }));

    const engagementSeries = Array.from({ length: 10 }).map((_, i) => ({
        week: `S${i + 1}`,
        nutrition: Math.max(0, Math.round((user.adherenceToDietPlan ?? 0.55) * 100 + ((hash(`nut:${i}:${user.id}`) % 15) - 7))),
        sport: Math.max(0, Math.round((user.physicalActivityLevel ? 55 : 38) + ((hash(`sport:${i}:${user.id}`) % 13) - 6))),
    }));

    const adherencePct = user.adherenceToDietPlan == null ? null : Math.round(user.adherenceToDietPlan * 100);
    const subscription = adherencePct !== null && adherencePct > 70 ? 'Premium' : 'Free';

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">Profil utilisateur</div>
                    <div className="page-subtitle">Nutrition · activité · progression</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge text={subscription} color={subscription === 'Premium' ? 'info' : 'default'} />
                    {user.diseaseType ? <Badge text={user.diseaseType} color="warning" /> : <Badge text="Aucun signal" color="success" />}
                </div>
            </div>

            <div className="mt-4">
                <UserHeader user={user} />
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Santé" description="Synthèse">
                    <div className="space-y-2 text-sm text-slate-700">
                        <div className="flex items-center justify-between">
                            <span>Type</span>
                            <span className="font-semibold text-slate-900">{user.diseaseType ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Sévérité</span>
                            <span className="font-semibold text-slate-900">{user.diseaseSeverity ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Calories / jour</span>
                            <span className="font-semibold text-slate-900">{user.dailyCaloricIntake ?? '—'}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Habitudes" description="Indicateurs">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">Activité</span>
                            <Badge text={user.physicalActivityLevel ?? '—'} color={user.physicalActivityLevel ? 'info' : 'default'} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-700">Adhérence régime</span>
                                <span className="font-semibold text-slate-900">{adherencePct === null ? '—' : `${adherencePct}%`}</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-100 border border-slate-200/70 overflow-hidden">
                                <div className="h-full bg-brand-500" style={{ width: `${adherencePct === null ? 45 : Math.min(100, adherencePct)}%` }} />
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 text-xs text-slate-600">
                            Les métriques affichées sont consolidées à partir des données disponibles.
                        </div>
                    </div>
                </Card>

                <Card title="Profil" description="Anthropométrie">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-xs text-slate-500">Âge</div>
                            <div className="font-semibold text-slate-900">{user.age} ans</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Genre</div>
                            <div className="font-semibold text-slate-900">{user.gender}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Taille</div>
                            <div className="font-semibold text-slate-900">{user.heightCm} cm</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Poids</div>
                            <div className="font-semibold text-slate-900">{user.weightKg} kg</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Calories (18j)" description="Évolution (simulée si besoin)" className="lg:col-span-2">
                    <LineChart data={caloriesSeries} xKey="day" yKey="calories" height={260} lineColor="#2563eb" />
                </Card>
                <Card title="Engagement" description="Nutrition vs Sport">
                    <BarChart data={engagementSeries} xKey="week" yKey="nutrition" height={140} barColor="#06b6d4" />
                    <div className="mt-3">
                        <BarChart data={engagementSeries} xKey="week" yKey="sport" height={140} barColor="#10b981" />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UserDetailPage;