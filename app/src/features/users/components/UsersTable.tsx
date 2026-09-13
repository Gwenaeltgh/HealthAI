import React from 'react';
import { Link } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import { User } from '../types';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { paths } from '../../../routes/paths';
import { useAppPreferences } from '../../../app/providers/AppPreferencesProvider';

type UsersTableProps = {
  users: User[];
  onOpenUser?: (user: User) => void;
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join('');
};

const UsersTable: React.FC<UsersTableProps> = ({ users, onOpenUser }) => {
  const { user } = useAuth();
  const { t } = useAppPreferences();
  const isEnterprise = user?.role === 'enterprise';
  const userDetailPath = (userId: string) => (isEnterprise ? paths.enterprise.userDetail(userId) : paths.users.detail(userId));

  const columns = React.useMemo(
    () => [
      {
        header: t('users.tableUser'),
        accessor: 'name',
        cell: (u: User) => (
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-brand-500 text-white shadow-soft text-xs font-semibold">
              {initials(u.name)}
            </div>
            <div className="min-w-0">
              <Link to={userDetailPath(u.id)} className="font-semibold text-slate-900 hover:text-primary-700">
                {u.name}
              </Link>
              <div className="text-xs text-slate-500 truncate">ID: {u.id}</div>
            </div>
          </div>
        ),
      },
      {
        header: t('users.tableProfile'),
        accessor: 'age',
        cell: (u: User) => (
          <div className="text-sm text-slate-800">
            <div>
              <span className="font-semibold">{u.age}</span> ans · {u.gender}
            </div>
            <div className="text-xs text-slate-500">{u.heightCm} cm · {u.weightKg} kg</div>
          </div>
        ),
      },
      {
        header: t('users.tableHealth'),
        accessor: 'diseaseType',
        cell: (u: User) => (
          <div className="flex flex-wrap gap-1.5">
            <Badge text={u.diseaseType ?? 'Aucun signal'} color={u.diseaseType ? 'warning' : 'success'} />
            {u.diseaseSeverity && <Badge text={u.diseaseSeverity} color="default" />}
          </div>
        ),
      },
      {
        header: t('users.tableNutrition'),
        accessor: 'dailyCaloricIntake',
        cell: (u: User) => {
          const adherence = u.adherenceToDietPlan;
          const pct = adherence === null || adherence === undefined ? null : Math.round(adherence * 100);
          return (
            <div className="space-y-2">
              <div className="text-sm text-slate-800">
                <span className="font-semibold">{u.dailyCaloricIntake ?? '—'}</span> kcal/j
              </div>
              <div className="h-2 rounded-full bg-slate-100 border border-slate-200/70 overflow-hidden">
                <div
                  className="h-full bg-brand-500"
                  style={{ width: `${pct === null ? 40 : Math.min(100, pct)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500">Adhérence: {pct === null ? '—' : `${pct}%`}</div>
            </div>
          );
        },
      },
      {
        header: t('users.tableActivity'),
        accessor: 'physicalActivityLevel',
        cell: (u: User) => {
          const lvl = u.physicalActivityLevel ?? '—';
          const color = lvl === 'high' ? 'success' : lvl === 'low' ? 'warning' : 'info';
          return <Badge text={lvl} color={lvl === '—' ? 'default' : (color as any)} />;
        },
      },
      {
        header: '',
        accessor: 'actions',
        className: 'text-right',
        cell: (u: User) => (
          <div className="flex justify-end gap-2">
            <Button variant="tertiary" size="small" onClick={() => onOpenUser?.(u)}>
              {t('common.quickView')}
            </Button>
            <Link to={userDetailPath(u.id)}>
              <Button size="small">
                {t('common.viewDetail')} <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [onOpenUser, isEnterprise, t]
  );

  return <Table columns={columns} data={users} rowKey={(u) => u.id} />;
};

export default UsersTable;