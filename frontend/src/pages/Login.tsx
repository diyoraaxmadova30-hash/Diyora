import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input as CustomInput } from '../components/Input';

export const Login: React.FC = () => {
    const { login, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) return <Navigate to="/" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token, data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-500 via-slate-50 to-purple-500 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />

            <Card variant="glass" className="w-full max-w-md p-10 animate-scale-in relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-primary to-primary-light rounded-3xl shadow-2xl shadow-primary/40 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <LogIn className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Welcome Back</h2>
                    <p className="text-slate-500 font-medium">Elevate your store management</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-accent/10 border border-accent/20 text-accent rounded-2xl text-sm flex items-center gap-3 animate-slide-up">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <CustomInput
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@shop.com"
                        icon={<Mail className="w-5 h-5" />}
                    />

                    <CustomInput
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        icon={<Lock className="w-5 h-5" />}
                    />

                    <div className="pt-4">
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="w-full py-5 text-lg"
                        >
                            Sign In to Portal
                        </Button>
                    </div>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Secure Admin Access Only
                    </p>
                </div>
            </Card>
        </div>
    );
};
