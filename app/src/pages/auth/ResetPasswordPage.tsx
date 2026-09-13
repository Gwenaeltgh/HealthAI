import React, { useState } from 'react';
import { useResetPassword } from '../../features/auth/hooks/useResetPassword';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useToast } from '../../app/providers/ToastProvider';
import { paths } from '../../routes/paths';

const ResetPasswordPage: React.FC = () => {
    const { addToast } = useToast();
    const { reset, isLoading, error, success } = useResetPassword();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await reset({ token, newPassword, confirmPassword });
            addToast('Mot de passe réinitialisé avec succès', 'success');
        } catch (err: any) {
            addToast(err?.message ?? 'Erreur', 'error');
        }
    };

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold mb-2">Réinitialiser le mot de passe</h1>
            <p className="mb-6 text-sm text-slate-600">
                Flow de réinitialisation prêt pour l’environnement courant.
                <a className="ml-1 font-medium text-teal-700 hover:text-teal-800" href={paths.auth.loginAdmin}>
                    Retour login
                </a>
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {error && <p className="text-sm text-rose-600">{error}</p>}
                {success && <p className="text-sm text-emerald-700">Mot de passe réinitialisé avec succès.</p>}
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Réinitialisation…' : 'Réinitialiser'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;