import React, { useState } from 'react';
import { useForgotPassword } from '../../features/auth/hooks/useForgotPassword';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useToast } from '../../app/providers/ToastProvider';
import { paths } from '../../routes/paths';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const { addToast } = useToast();
    const { handleForgotPassword, isLoading, error, success } = useForgotPassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await handleForgotPassword(email);
            addToast('Si un compte existe, un email sera envoyé.', 'success');
        } catch (err: any) {
            addToast(err?.message ?? 'Impossible d’envoyer les instructions', 'error');
        }
    };

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold mb-2">Mot de passe oublié</h1>
            <p className="mb-6 text-sm text-slate-600">
                Flow de récupération prêt pour l’environnement courant.
                <a className="ml-1 font-medium text-teal-700 hover:text-teal-800" href={paths.auth.loginAdmin}>
                    Retour login
                </a>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
            </form>
            {success && <div className="mt-4 text-sm text-emerald-700">Instructions envoyées si le compte existe.</div>}
            {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
        </AuthLayout>
    );
};

export default ForgotPasswordPage;