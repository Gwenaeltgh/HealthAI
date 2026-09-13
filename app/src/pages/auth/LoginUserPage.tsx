import React, { useState } from 'react';
import { useLogin } from '../../features/auth/hooks/useLogin';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { paths } from '../../routes/paths';
import { useToast } from '../../app/providers/ToastProvider';

const LoginUserPage: React.FC = () => {
    const { login, isLoading, error } = useLogin();
    const { addToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password, 'user');
            addToast('Connexion réussie', 'success');
        } catch (err: any) {
            addToast(err?.message ?? 'Connexion utilisateur non disponible', 'info');
        }
    };

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold mb-4">Connexion Utilisateur</h1>
            <p className="mb-6 text-sm text-slate-600">
                Cette interface backoffice utilise principalement l’auth admin. 
                <a className="font-medium text-teal-700 hover:text-teal-800" href={paths.auth.loginAdmin}> Aller au login admin</a>
            </p>
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
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Chargement...' : 'Se connecter'}
                </Button>
            </form>
            {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
        </AuthLayout>
    );
};

export default LoginUserPage;