'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFeedback } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';

const TYPES = [
    { value: 'job_application', label: 'Job application' },
    { value: 'support', label: 'Support' },
    { value: 'form_submission', label: 'Form submission' },
    { value: 'bug', label: 'Bug report' },
    { value: 'feature_request', label: 'Feature request' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'question', label: 'Question' },
    { value: 'general', label: 'General' },
];

const SEGMENTS = [
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'mid_market', label: 'Mid-market' },
    { value: 'small_business', label: 'Small business' },
    { value: 'startup', label: 'Startup' },
];

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
                title, description, category,
                customer: { name: customerName, email: customerEmail, company: customerCompany, segment: customerSegment },
            });
            toast.success('Conversation logged!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to log conversation');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageWrapper>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg-page:    #f2f0eb;
          --bg-surface: #ffffff;
          --bg-subtle:  #f5f4f1;
          --bg-hover:   #faf9f7;
          --border:     rgba(0,0,0,0.07);
          --border-mid: rgba(0,0,0,0.13);
          --text-primary: #1a1a18;
          --text-muted:   #6b6a66;
          --text-faint:   #a0a09a;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-page:    #111110;
            --bg-surface: #1c1c1a;
            --bg-subtle:  #242422;
            --bg-hover:   #282826;
            --border:     rgba(255,255,255,0.07);
            --border-mid: rgba(255,255,255,0.13);
            --text-primary: #f0eeea;
            --text-muted:   #8a8880;
            --text-faint:   #58574f;
          }
        }

        .lc-shell {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg-page);
          color: var(--text-primary);
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
        }

        /* Topbar */
        .topbar {
          height: 56px; flex-shrink: 0;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          padding: 0 24px; gap: 12px;
          z-index: 100;
        }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: var(--text-muted);
          border: none; background: none; cursor: pointer;
          padding: 5px 8px; border-radius: 8px; flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .back-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }
        .topbar-divider { width: 1px; height: 18px; background: var(--border-mid); flex-shrink: 0; }
        .topbar-title { font-size: 13.5px; font-weight: 500; flex: 1; color: var(--text-primary); }
        .topbar-actions { display: flex; gap: 8px; align-items: center; }

        .cancel-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; padding: 7px 16px;
          border-radius: 100px; border: 1px solid var(--border-mid);
          background: none; color: var(--text-muted);
          cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .cancel-btn:hover { background: var(--bg-subtle); color: var(--text-primary); border-color: var(--border-mid); }

        .submit-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; padding: 7px 20px;
          border-radius: 100px; border: none;
          background: #1a1a18; color: #f5f4f1;
          cursor: pointer; white-space: nowrap;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @media (prefers-color-scheme: dark) {
          .submit-btn { background: #f0eeea; color: #1a1a18; }
        }

        /* Scrollable content */
        .page-scroll { flex: 1; overflow-y: auto; padding: 32px 24px; }
        .form-wrap { max-width: 660px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }

        /* Cards */
        .card {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 24px;
        }
        .card-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.9px;
          color: var(--text-faint); text-transform: uppercase;
          margin-bottom: 18px;
        }
        .fields { display: flex; flex-direction: column; gap: 16px; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* Field */
        .field-label {
          display: block; font-size: 12px; font-weight: 500;
          color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.01em;
        }
        .field-input, .field-select, .field-textarea {
          width: 100%; font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; padding: 10px 14px;
          border-radius: 10px; border: 1px solid var(--border-mid);
          background: var(--bg-subtle); color: var(--text-primary);
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none; -webkit-appearance: none;
        }
        .field-input::placeholder, .field-textarea::placeholder { color: var(--text-faint); }
        .field-input:focus, .field-select:focus, .field-textarea:focus {
          border-color: rgba(0,0,0,0.3);
          box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
        }
        @media (prefers-color-scheme: dark) {
          .field-input:focus, .field-select:focus, .field-textarea:focus {
            border-color: rgba(255,255,255,0.22);
            box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
          }
        }
        .field-textarea { resize: none; line-height: 1.65; }

        /* Select wrapper with custom arrow */
        .select-wrap { position: relative; }
        .select-wrap::after {
          content: '';
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid var(--text-faint);
          pointer-events: none;
        }
        .field-select { cursor: pointer; padding-right: 36px; }

        /* Info note */
        .info-note {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 16px; border-radius: 12px;
          background: #E6F1FB; border: 1px solid rgba(55,138,221,0.2);
        }
        @media (prefers-color-scheme: dark) {
          .info-note { background: rgba(55,138,221,0.1); border-color: rgba(55,138,221,0.2); }
          .info-note-text { color: #85B7EB !important; }
        }
        .info-note-text { font-size: 12.5px; color: #185FA5; line-height: 1.6; font-weight: 300; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up   { animation: fadeUp 0.35s ease both; }
        .fade-up-1 { animation: fadeUp 0.35s 0.06s ease both; }
        .fade-up-2 { animation: fadeUp 0.35s 0.12s ease both; }
      `}</style>

            <Toaster position="top-center" toastOptions={{
                style: { fontFamily: 'DM Sans, sans-serif', fontSize: 13, borderRadius: 10, background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
            }} />

            <div className="lc-shell">

                {/* Topbar */}
                <div className="topbar">
                    <button className="back-btn" onClick={() => router.push('/dashboard')}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M10 3L5 8l5 5" />
                        </svg>
                        Inbox
                    </button>
                    <div className="topbar-divider" />
                    <div className="topbar-title">Log a conversation</div>
                    <div className="topbar-actions">
                        <button className="cancel-btn" onClick={() => router.push('/dashboard')}>Cancel</button>
                        <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Log conversation'}
                        </button>
                    </div>
                </div>

                {/* Scrollable form */}
                <div className="page-scroll">
                    <div className="form-wrap">

                        {/* Conversation details */}
                        <div className="card fade-up">
                            <div className="card-label">Conversation details</div>
                            <div className="fields">
                                <div>
                                    <label className="field-label">Subject</label>
                                    <input
                                        className="field-input"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="What is this conversation about?"
                                    />
                                </div>
                                <div>
                                    <label className="field-label">Their message</label>
                                    <textarea
                                        className="field-textarea field-input"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="What did they say or send? Paste their message here..."
                                        rows={5}
                                    />
                                </div>
                                <div>
                                    <label className="field-label">Type</label>
                                    <div className="select-wrap">
                                        <select
                                            className="field-select"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                        >
                                            <option value="">Select a type</option>
                                            {TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact details */}
                        <div className="card fade-up-1">
                            <div className="card-label">Contact details</div>
                            <div className="fields">
                                <div className="field-grid">
                                    <div>
                                        <label className="field-label">Full name</label>
                                        <input
                                            className="field-input"
                                            value={customerName}
                                            onChange={e => setCustomerName(e.target.value)}
                                            placeholder="Jane Smith"
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Email</label>
                                        <input
                                            className="field-input"
                                            type="email"
                                            value={customerEmail}
                                            onChange={e => setCustomerEmail(e.target.value)}
                                            placeholder="jane@company.com"
                                        />
                                    </div>
                                </div>
                                <div className="field-grid">
                                    <div>
                                        <label className="field-label">Company</label>
                                        <input
                                            className="field-input"
                                            value={customerCompany}
                                            onChange={e => setCustomerCompany(e.target.value)}
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                    <div>
                                        <label className="field-label">Segment</label>
                                        <div className="select-wrap">
                                            <select
                                                className="field-select"
                                                value={customerSegment}
                                                onChange={e => setCustomerSegment(e.target.value)}
                                            >
                                                <option value="">Select a segment</option>
                                                {SEGMENTS.map(s => (
                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info note */}
                        <div className="info-note fade-up-2">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                                <circle cx="8" cy="8" r="6" /><path d="M8 7v4M8 5.5v.5" />
                            </svg>
                            <div className="info-note-text">
                                If this contact already exists (same name + company), they'll be linked automatically. No duplicates created.
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}