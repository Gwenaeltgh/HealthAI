import React, { useState } from 'react';
import { useRegister } from '../../features/auth/hooks/useRegister';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useToast } from '../../app/providers/ToastProvider';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';

const RegisterPage: React.FC = () => {
    const { register, isLoading, error } = useRegister();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        try {
            await register(email, password, 'admin');
            addToast('Compte admin créé', 'success');
            navigate(paths.dashboard.main, { replace: true });
        } catch (err: any) {
            addToast(err?.message ?? 'Impossible de créer le compte', 'error');
        }
    };

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold mb-2">Créer le premier admin</h1>
            <p className="mb-6 text-sm text-slate-600">
                En mode API réelle, le backend autorise cette création uniquement depuis localhost et uniquement si aucun admin n’existe.
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Registering...' : 'Register'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;