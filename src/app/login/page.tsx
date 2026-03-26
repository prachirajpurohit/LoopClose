'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, ping } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) router.push('/dashboard');
        ping();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) return toast.error('Fill in both fields');
        setLoading(true);
        try {
            const res = await login(email, password);
            // const token = res.data.token;
            const token = res.data.data.accessToken;
            localStorage.setItem('token', token);
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div style={{
                minHeight: '100vh', background: '#faf9f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Sans, sans-serif'
            }}>
                <Toaster position="top-center" />
                <div style={{
                    background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)',
                    borderRadius: 16, padding: '40px 40px', width: 380,
                    display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E24B4A' }} />
                        <span style={{ fontSize: 15, fontWeight: 500, color: '#6b6a66' }}>CloseLoop</span>
                    </div>

                    <div>
                        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4, color: '#6b6a66' }}>Sign in</div>
                        <div style={{ fontSize: 13, color: '#6b6a66' }}>Enter your credentials to continue</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, color: '#6b6a66', display: 'block', marginBottom: 6 }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="you@example.com"
                                style={{
                                    width: '100%', padding: '10px 12px', fontSize: 13,
                                    border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
                                    outline: 'none', fontFamily: 'inherit', background: '#faf9f6', color: '#6b6a66'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: '#6b6a66', display: 'block', marginBottom: 6 }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '10px 12px', fontSize: 13,
                                    border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
                                    outline: 'none', fontFamily: 'inherit', background: '#faf9f6', color: '#6b6a66'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '11px', fontSize: 14, fontWeight: 500,
                            background: loading ? '#888' : '#1a1a18', color: '#faf9f6',
                            border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'background 0.15s'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div style={{ fontSize: 12, color: '#6b6a66', textAlign: 'center' }}>
                        No account?{' '}
                        <a href="/register" style={{ color: '#1a1a18', fontWeight: 500 }}>Register here</a>
                    </div>
                </div>
            </div>
        </PageWrapper >
    );
}