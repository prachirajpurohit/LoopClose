'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFeedback } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';

const TYPES = ['job_application', 'support', 'form_submission', 'general'];
const SEGMENTS = ['enterprise', 'mid_market', 'small_business', 'startup'];

export default function NewConversationPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [customerSegment, setCustomerSegment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) return toast.error('Subject is required');
        if (!description.trim()) return toast.error('Their message is required');
        if (!category) return toast.error('Pick a type');
        if (!customerName.trim()) return toast.error('Contact name is required');
        if (!customerEmail.trim()) return toast.error('Contact email is required');
        if (!customerCompany.trim()) return toast.error('Contact company is required');
        if (!customerSegment) return toast.error('Pick a segment');

        setSubmitting(true);
        try {
            await createFeedback({
                title,
                description,
                category,
                customer: {
                    name: customerName,
                    email: customerEmail,
                    company: customerCompany,
                    segment: customerSegment,
                },
            });
            toast.success('Conversation logged!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to log conversation');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 12px', fontSize: 13,
        border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 8,
        outline: 'none', fontFamily: 'inherit', background: '#faf9f6', color: '#1a1a18',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 12, color: '#6b6a66', display: 'block', marginBottom: 6,
    };

    const sectionLabel = (text: string) => (
        <div style={{ fontSize: 11, color: '#6b6a66', letterSpacing: '0.4px', marginBottom: 12 }}>{text}</div>
    );

    return (
        <PageWrapper>
            <div style={{ minHeight: '100vh', background: '#efede8', fontFamily: 'DM Sans, sans-serif' }}>
                <Toaster position="top-center" />

                {/* Topbar */}
                <div style={{ background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.12)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => router.push('/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6a66', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '5px 8px', borderRadius: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3L5 8l5 5" /></svg>
                        Inbox
                    </button>
                    <div style={{ width: '0.5px', height: 18, background: 'rgba(0,0,0,0.2)' }} />
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'black' }}>Log a conversation</div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        <button onClick={() => router.push('/dashboard')}
                            style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.2)', background: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#6b6a66' }}>
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={submitting}
                            style={{ fontSize: 13, fontWeight: 500, padding: '7px 20px', borderRadius: 8, background: submitting ? '#888' : '#1a1a18', color: '#faf9f6', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                            {submitting ? 'Saving...' : 'Log conversation'}
                        </button>
                    </div>
                </div>

                <div style={{ maxWidth: 680, margin: '32px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Conversation details */}
                    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: 24 }}>
                        {sectionLabel('CONVERSATION DETAILS')}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Subject</label>
                                <input value={title} onChange={e => setTitle(e.target.value)}
                                    placeholder="What is this conversation about?" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Their message</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="What did they say or send? Paste their message here..."
                                    rows={5} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Type</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                    style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="">Select a type</option>
                                    {TYPES.map(t => (
                                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact details */}
                    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: 24 }}>
                        {sectionLabel('CONTACT DETAILS')}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={labelStyle}>Full name</label>
                                    <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                                        placeholder="Jane Smith" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                                        placeholder="jane@company.com" style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={labelStyle}>Company</label>
                                    <input value={customerCompany} onChange={e => setCustomerCompany(e.target.value)}
                                        placeholder="Acme Corp" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Segment</label>
                                    <select value={customerSegment} onChange={e => setCustomerSegment(e.target.value)}
                                        style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="">Select a segment</option>
                                        {SEGMENTS.map(s => (
                                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info note */}
                    <div style={{ background: '#E6F1FB', border: '0.5px solid #B5D4F4', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#185FA5" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}>
                            <circle cx="8" cy="8" r="6" /><path d="M8 7v4M8 5.5v.5" />
                        </svg>
                        <div style={{ fontSize: 12, color: '#185FA5', lineHeight: 1.5 }}>
                            If this contact already exists (same name + company), they'll be linked automatically. No duplicates created.
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper >
    );
}