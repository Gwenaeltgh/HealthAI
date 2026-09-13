import React from 'react';
import Drawer from '../../../components/ui/Drawer';
import { User } from '../types';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import LineChart from '../../../components/charts/LineChart';
import { useAppPreferences } from '../../../app/providers/AppPreferencesProvider';

interface UserDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDrawer: React.FC<UserDrawerProps> = ({ user, isOpen, onClose }) => {
  const { t } = useAppPreferences();

  if (!user) {
    return null;
  }

  const hash = (value: string) => {
    let result = 0;
    for (let index = 0; index < value.length; index += 1) {
      result = (result * 31 + value.charCodeAt(index)) >>> 0;
    }
    return result;
  };

  const caloriesSeries = Array.from({ length: 14 }).map((_, i) => ({
    day: `J${i + 1}`,
    calories: Math.max(
      1200,
      Math.round((user.dailyCaloricIntake ?? 2100) * (0.9 + ((hash(`${user.id}:${i}`) % 12) / 100)))
    ),
  }));

  const adherence = user.adherenceToDietPlan ?? null;
  const adherencePct = adherence === null ? null : Math.round(adherence * 100);

  const subscription = adherence !== null && adherence > 0.7 ? 'Premium' : 'Free';

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <div className="text-lg font-semibold text-slate-900">{user.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge text={`${user.age} ${t('users.ageSuffix')}`} color="default" />
            <Badge text={String(user.gender)} color="default" />
            <Badge text={subscription} color={subscription === 'Premium' ? 'info' : 'default'} />
            {user.diseaseType && <Badge text={user.diseaseType} color="warning" />}
          </div>
        </div>

        <Card title={t('users.profileCard')}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-500">{t('users.weight')}</div>
              <div className="font-semibold text-slate-900">{user.weightKg} kg</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t('users.height')}</div>
              <div className="font-semibold text-slate-900">{user.heightCm} cm</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t('users.activity')}</div>
              <div className="font-semibold text-slate-900">{user.physicalActivityLevel ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">{t('users.caloriesPerDay')}</div>
              <div className="font-semibold text-slate-900">{user.dailyCaloricIntake ?? '—'}</div>
            </div>
          </div>
        </Card>

        <Card title={t('users.nutritionAdherence')} description={t('users.nutritionAdherenceDescription')}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">{t('users.score')}</div>
            <div className="text-sm font-semibold text-slate-900">{adherencePct === null ? '—' : `${adherencePct}%`}</div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100 border border-slate-200/70 overflow-hidden">
            <div
              className="h-full bg-brand-500"
              style={{ width: `${adherencePct === null ? 40 : Math.min(100, adherencePct)}%` }}
            />
          </div>
        </Card>

        <Card title={t('users.calories14d')} description={t('users.calories14dDescription')}>
          <LineChart data={caloriesSeries} xKey="day" yKey="calories" height={180} lineColor="#06b6d4" />
        </Card>
      </div>
    </Drawer>
  );
};

export default UserDrawer;