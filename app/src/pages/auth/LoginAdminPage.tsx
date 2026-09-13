import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../features/auth/hooks/useLogin';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { paths } from '../../routes/paths';
import { useToast } from '../../app/providers/ToastProvider';
import { isRealApiEnabled } from '../../api/env';

const LoginAdminPage: React.FC = () => {
    const { login, isLoading, error } = useLogin();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@healthai.local');
    const [password, setPassword] = useState('Password123!');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password, 'admin');
            addToast('Connexion réussie', 'success');
            navigate(paths.dashboard.main, { replace: true });
        } catch (err: any) {
            addToast(err?.message ?? 'Erreur de connexion', 'error');
        }
    };

    return (
        <AuthLayout>
            <div className="mb-6">
                <div className="text-sm font-semibold tracking-wide text-teal-600">HealthAI Coach</div>
                <h1 className="mt-1 text-2xl font-bold">Connexion admin</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Accès sécurisé au backoffice (cookies de session).
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div className="flex items-center justify-between">
                    <a className="text-sm text-slate-600 hover:text-slate-900" href={paths.auth.forgotPassword}>
                        Mot de passe oublié ?
                    </a>
                    <div className="flex items-center gap-3 text-sm">
                        <a className="text-slate-600 hover:text-slate-900" href={paths.auth.loginEnterprise}>
                            Espace entreprise
                        </a>
                        <a className="text-slate-600 hover:text-slate-900" href={paths.auth.register}>
                            Créer le premier admin
                        </a>
                    </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Mode actuel: <span className="font-medium">{isRealApiEnabled() ? 'API réelle' : 'Environnement local'}</span>. 
                Identifiants de développement: <span className="font-medium">admin@healthai.local / Password123!</span>
            </div>
        </AuthLayout>
    );
};

export default LoginAdminPage;