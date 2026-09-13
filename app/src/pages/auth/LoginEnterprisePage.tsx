import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../features/auth/hooks/useLogin';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { paths } from '../../routes/paths';
import { useToast } from '../../app/providers/ToastProvider';

const LoginEnterprisePage: React.FC = () => {
    const { login, isLoading, error } = useLogin();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('enterprise-01@local.test');
    const [password, setPassword] = useState('Enterprise123!');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password, 'enterprise');
            addToast('Connexion entreprise réussie', 'success');
            navigate(paths.enterprise.main, { replace: true });
        } catch (err: any) {
            addToast(err?.message ?? 'Erreur de connexion entreprise', 'error');
        }
    };

    return (
        <AuthLayout>
            <div className="mb-6">
                <div className="text-sm font-semibold tracking-wide text-teal-600">HealthAI Coach</div>
                <h1 className="mt-1 text-2xl font-bold">Connexion entreprise</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Accès sécurisé au backoffice entreprise, avec données isolées par compte.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="email"
                    placeholder="Email entreprise"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Parcours B2B dédié</span>
                    <a className="text-sm text-slate-600 hover:text-slate-900" href={paths.auth.loginAdmin}>
                        Retour login admin
                    </a>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Connexion…' : 'Entrer dans mon espace'}
                </Button>
            </form>
            {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Compte de test disponible pour l’environnement local: <span className="font-medium">enterprise-01@local.test / Enterprise123!</span>
            </div>
        </AuthLayout>
    );
};

export default LoginEnterprisePage;