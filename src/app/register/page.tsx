'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { register, login } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [fullname, setFullname] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) router.push('/dashboard');
    }, []);

    const handleRegister = async () => {
        if (!fullname || !username || !email || !password)
            return toast.error('Fill in all fields');
        setLoading(true);
        try {
            await register(fullname, username, email, password);
            // auto login after register
            const loginRes = await login(email, password);
            const token = loginRes.data.data.accessToken;
            localStorage.setItem('token', token);
            toast.success('Account created!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed');
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E24B4A' }} />
                        <span style={{ fontSize: 15, fontWeight: 500, color: '#6b6a66' }}>CloseLoop</span>
                    </div>

                    <div>
                        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4, color: '#6b6a66' }}>Create account</div>
                        <div style={{ fontSize: 13, color: '#6b6a66' }}>Get started with CloseLoop</div>
                    </div>

                    <div>
                        <label style={{ fontSize: 12, color: '#6b6a66', display: 'block', marginBottom: 6 }}>Full name</label>
                        <input
                            type="text"
                            value={fullname}
                            onChange={e => setFullname(e.target.value)}
                            placeholder="John Doe"
                            style={{
                                width: '100%', padding: '10px 12px', fontSize: 13,
                                border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
                                outline: 'none', fontFamily: 'inherit', background: '#faf9f6', color: '#6b6a66'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, color: '#6b6a66', display: 'block', marginBottom: 6 }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="johndoe"
                            style={{
                                width: '100%', padding: '10px 12px', fontSize: 13,
                                border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
                                outline: 'none', fontFamily: 'inherit', background: '#faf9f6', color: '#6b6a66'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, color: '#6b6a66', display: 'block', marginBottom: 6 }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleRegister()}
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
                                onKeyDown={e => e.key === 'Enter' && handleRegister()}
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
                        onClick={handleRegister}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '11px', fontSize: 14, fontWeight: 500,
                            background: loading ? '#888' : '#1a1a18', color: '#faf9f6',
                            border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'background 0.15s'
                        }}
                    >
                        {loading ? 'Creating...' : 'Create account'}
                    </button>

                    <div style={{ fontSize: 12, color: '#6b6a66', textAlign: 'center' }}>
                        Already have an account?{' '}
                        <a href="/login" style={{ color: '#1a1a18', fontWeight: 500 }}>Sign in</a>
                    </div>
                </div>
            </div>
        </PageWrapper >
    );
}