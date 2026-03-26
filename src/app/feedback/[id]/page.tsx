'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getFeedbackById, changeFeedbackStatus, getFeedbackHistory, getComments, postComment, deleteComment } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';

const VALID_STATUSES = ['new', 'in_progress', 'resolved', 'closed', 'not_applicable'];

const STATUS_LABELS: Record<string, string> = {
    new: 'New',
    in_progress: 'In progress',
    resolved: 'Resolved',
    closed: 'Closed',
    not_applicable: 'Not applicable',
    under_review: 'In progress',
    planned: 'In progress',
    completed: 'Resolved',
    wont_do: 'Not applicable',
};

const TYPE_LABELS: Record<string, string> = {
    bug: 'Bug report',
    feature_request: 'Feature request',
    improvement: 'Improvement',
    question: 'Question',
    job_application: 'Job application',
    support: 'Support',
    form_submission: 'Form submission',
    general: 'General',
};

const isClosed = (s: string) =>
    ['completed', 'wont_do', 'resolved', 'closed', 'not_applicable'].includes(s);

const STATUS_STYLES: Record<string, { bg: string; color: string; darkBg: string; darkColor: string }> = {
    new: { bg: '#E6F1FB', color: '#185FA5', darkBg: 'rgba(55,138,221,0.15)', darkColor: '#85B7EB' },
    in_progress: { bg: '#FDF4E7', color: '#854F0B', darkBg: 'rgba(239,159,39,0.15)', darkColor: '#fbbf24' },
    resolved: { bg: '#EAF3DE', color: '#2D6B0A', darkBg: 'rgba(99,153,34,0.15)', darkColor: '#82c22a' },
    closed: { bg: '#EAF3DE', color: '#2D6B0A', darkBg: 'rgba(99,153,34,0.15)', darkColor: '#82c22a' },
    not_applicable: { bg: '#F1EFE8', color: '#5F5E5A', darkBg: 'rgba(136,135,128,0.15)', darkColor: '#8a8880' },
    under_review: { bg: '#FDF4E7', color: '#854F0B', darkBg: 'rgba(239,159,39,0.15)', darkColor: '#fbbf24' },
    planned: { bg: '#FDF4E7', color: '#854F0B', darkBg: 'rgba(239,159,39,0.15)', darkColor: '#fbbf24' },
    completed: { bg: '#EAF3DE', color: '#2D6B0A', darkBg: 'rgba(99,153,34,0.15)', darkColor: '#82c22a' },
    wont_do: { bg: '#F1EFE8', color: '#5F5E5A', darkBg: 'rgba(136,135,128,0.15)', darkColor: '#8a8880' },
};

export default function ConversationDetailPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [feedback, setFeedback] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [reason, setReason] = useState('');
    const [updating, setUpdating] = useState(false);
    const [note, setNote] = useState('');
    const [postingNote, setPostingNote] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        loadAll();
    }, [id]);

    const loadAll = async () => {
        // load feedback first — most critical, unblocks everything
        try {
            const fbRes = await getFeedbackById(id);
            setFeedback(fbRes.data.data);
            setNewStatus(fbRes.data.data.status);
        } catch {
            toast.error('Failed to load conversation');
            return;
        }

        // history and comments load in background — don't block the page
        getFeedbackHistory(id)
            .then(r => setHistory(r.data.data || []))
            .catch(() => { });

        getComments(id)
            .then(r => setComments(r.data.data || []))
            .catch(() => { });
    };

    const handleUpdateStatus = async () => {
        if (newStatus === feedback.status) return toast.error('Pick a different status first');
        if (newStatus === 'not_applicable' && !reason.trim()) return toast.error('Reason required for "not applicable"');
        setUpdating(true);
        try {
            const backendStatus: Record<string, string> = {
                new: 'new', in_progress: 'in_progress',
                resolved: 'completed', closed: 'completed', not_applicable: 'wont_do',
            };
            await changeFeedbackStatus(id, { status: backendStatus[newStatus] || newStatus, reason });
            toast.success('Status updated');
            loadAll();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handlePostNote = async () => {
        if (!note.trim()) return toast.error('Write something first');
        setPostingNote(true);
        try {
            await postComment(id, note.trim());
            setNote('');
            toast.success('Note added');
            loadAll();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to add note');
        } finally {
            setPostingNote(false);
        }
    };

    const handleDeleteNote = async (commentId: string) => {
        setDeletingId(commentId);
        try {
            await deleteComment(commentId);
            toast.success('Note deleted');
            loadAll();
        } catch {
            toast.error('Failed to delete note');
        } finally {
            setDeletingId(null);
        }
    };

    const getDaysAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'today';
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    };

    const getTimeStr = (date: string) =>
        new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const isOverdue = () => {
        if (!feedback || isClosed(feedback.status)) return false;
        return Math.floor((Date.now() - new Date(feedback.createdAt).getTime()) / 86400000) >= 2;
    };

    const initials = (name: string) =>
        name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

    if (!feedback) return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#a0a09a' }}>
            Loading conversation...
        </div>
    );

    const contact = feedback.customerId;
    const overdue = isOverdue();
    const closed = isClosed(feedback.status);
    const ss = STATUS_STYLES[feedback.status] || STATUS_STYLES.new;
    const waitingDays = Math.floor((Date.now() - new Date(feedback.createdAt).getTime()) / 86400000);

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
          --border-mid: rgba(0,0,0,0.12);
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
            --border-mid: rgba(255,255,255,0.12);
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
          display: flex; align-items: center; padding: 0 20px; gap: 12px;
          z-index: 100;
        }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: var(--text-muted);
          border: none; background: none; cursor: pointer;
          padding: 5px 8px; border-radius: 8px;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .back-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }
        .topbar-divider { width: 1px; height: 18px; background: var(--border-mid); flex-shrink: 0; }
        .topbar-title {
          font-size: 13.5px; font-weight: 500; color: var(--text-primary);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
        }
        .status-badge {
          font-size: 11.5px; font-weight: 500; padding: 4px 12px;
          border-radius: 100px; flex-shrink: 0; letter-spacing: 0.01em;
        }
        .overdue-badge {
          font-size: 11.5px; font-weight: 500; padding: 4px 12px;
          border-radius: 100px; flex-shrink: 0;
          background: #FCEBEB; color: #A32D2D;
        }
        @media (prefers-color-scheme: dark) {
          .overdue-badge { background: rgba(226,75,74,0.18); color: #f09595; }
        }

        /* Layout */
        .layout { display: flex; flex: 1; overflow: hidden; }

        /* Left sidebar — contact info */
        .sidebar {
          width: 236px; flex-shrink: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          overflow-y: auto;
        }

        .contact-block {
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .contact-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          background: #EEEDFE; color: #534AB7;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 500; flex-shrink: 0;
        }
        .contact-name { font-size: 14px; font-weight: 500; text-align: center; color: var(--text-primary); }
        .contact-email { font-size: 12px; color: var(--text-muted); text-align: center; word-break: break-all; }
        .waiting-pill {
          font-size: 11px; font-weight: 500; padding: 3px 10px;
          border-radius: 100px; font-family: 'DM Mono', monospace;
          background: #FCEBEB; color: #A32D2D;
        }
        @media (prefers-color-scheme: dark) {
          .waiting-pill { background: rgba(226,75,74,0.18); color: #f09595; }
        }

        .meta-block { padding: 18px 20px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 12px; }
        .meta-section-label { font-size: 10px; font-weight: 500; letter-spacing: 0.9px; color: var(--text-faint); text-transform: uppercase; margin-bottom: 2px; }
        .meta-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 12.5px; }
        .meta-key { color: var(--text-muted); flex-shrink: 0; }
        .meta-val { font-weight: 500; color: var(--text-primary); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px; }

        .history-block { padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; }
        .history-entry { font-size: 12px; color: var(--text-muted); line-height: 1.5; padding-left: 12px; border-left: 2px solid var(--border-mid); }
        .history-status { color: var(--text-primary); font-weight: 500; }
        .history-reason { font-style: italic; color: var(--text-faint); margin-top: 2px; }

        /* Main content */
        .main {
          flex: 1; display: flex; flex-direction: column;
          overflow: hidden; min-width: 0;
        }
        .main-scroll {
          flex: 1; overflow-y: auto;
          padding: 24px; display: flex; flex-direction: column; gap: 16px;
        }

        /* Overdue banner */
        .overdue-banner {
          background: #FEF0F0; border: 1px solid rgba(226,75,74,0.2);
          border-radius: 12px; padding: 13px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        @media (prefers-color-scheme: dark) {
          .overdue-banner { background: rgba(226,75,74,0.1); border-color: rgba(226,75,74,0.2); }
          .overdue-banner-text { color: #f09595 !important; }
        }
        .overdue-dot { width: 7px; height: 7px; border-radius: 50%; background: #E24B4A; flex-shrink: 0; }

        /* Message card */
        .message-card {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 22px 24px;
        }
        .message-section-label { font-size: 10px; font-weight: 500; letter-spacing: 0.9px; color: var(--text-faint); text-transform: uppercase; margin-bottom: 14px; }
        .message-title { font-size: 16px; font-weight: 500; color: var(--text-primary); margin-bottom: 10px; line-height: 1.4; }
        .message-body { font-size: 14px; color: var(--text-muted); line-height: 1.75; font-weight: 300; }
        .message-meta { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); font-size: 11.5px; color: var(--text-faint); font-family: 'DM Mono', monospace; }

        /* Closed state */
        .closed-card {
          background: #EDF6E4; border: 1px solid rgba(99,153,34,0.2);
          border-radius: 14px; padding: 28px 24px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          text-align: center;
        }
        @media (prefers-color-scheme: dark) {
          .closed-card { background: rgba(99,153,34,0.1); border-color: rgba(99,153,34,0.2); }
          .closed-card-title { color: #82c22a !important; }
          .closed-card-sub { color: #82c22a !important; opacity: 0.7; }
        }
        .closed-icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(99,153,34,0.2);
          display: flex; align-items: center; justify-content: center;
        }

        /* Notes */
        .notes-card {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
        }
        .notes-header { padding: 14px 20px; border-bottom: 1px solid var(--border); }
        .notes-title { font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px; }
        .notes-sub { font-size: 12px; color: var(--text-faint); }
        .note-row {
          padding: 14px 20px; border-bottom: 1px solid var(--border);
          display: flex; gap: 12px; align-items: flex-start;
        }
        .note-row:last-child { border-bottom: none; }
        .note-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: #EEEDFE; color: #534AB7;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 500; flex-shrink: 0;
        }
        .note-author { font-size: 12.5px; font-weight: 500; color: var(--text-primary); }
        .note-time { font-size: 11px; color: var(--text-faint); font-family: 'DM Mono', monospace; }
        .note-body { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-top: 4px; font-weight: 300; }
        .note-delete {
          background: none; border: none; cursor: pointer;
          color: var(--text-faint); padding: 4px; border-radius: 6px;
          flex-shrink: 0; transition: background 0.15s, color 0.15s;
        }
        .note-delete:hover { background: var(--bg-subtle); color: var(--text-muted); }
        .empty-notes { padding: 28px 20px; font-size: 13px; color: var(--text-faint); font-weight: 300; }

        /* Add note area */
        .add-note {
          padding: 14px 20px; border-top: 1px solid var(--border);
          display: flex; gap: 10px; align-items: flex-end;
        }
        .note-textarea {
          flex: 1; font-size: 13px; padding: 10px 14px;
          border-radius: 10px; border: 1px solid var(--border-mid);
          background: var(--bg-subtle); font-family: inherit;
          resize: none; outline: none; line-height: 1.6;
          color: var(--text-primary);
          transition: border-color 0.2s;
        }
        .note-textarea::placeholder { color: var(--text-faint); }
        .note-textarea:focus { border-color: rgba(0,0,0,0.25); }
        @media (prefers-color-scheme: dark) {
          .note-textarea:focus { border-color: rgba(255,255,255,0.2); }
        }
        .add-note-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; padding: 9px 18px;
          border-radius: 100px; border: none; cursor: pointer;
          background: var(--text-primary); color: var(--bg-surface);
          white-space: nowrap; flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }
        .add-note-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.18); }
        .add-note-btn:active { transform: translateY(0); }
        .add-note-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Status action bar */
        .action-bar {
          border-top: 1px solid var(--border);
          background: var(--bg-surface);
          padding: 16px 24px;
          display: flex; flex-direction: column; gap: 10px;
          flex-shrink: 0;
        }
        .action-bar-label { font-size: 10px; font-weight: 500; letter-spacing: 0.9px; color: var(--text-faint); text-transform: uppercase; }
        .action-bar-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .status-select {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; padding: 9px 14px;
          border-radius: 100px; border: 1px solid var(--border-mid);
          background: var(--bg-subtle); color: var(--text-primary);
          cursor: pointer; outline: none;
          transition: border-color 0.2s;
        }
        .status-select:hover { border-color: rgba(0,0,0,0.25); }
        @media (prefers-color-scheme: dark) {
          .status-select:hover { border-color: rgba(255,255,255,0.2); }
        }
        .reason-input {
          flex: 1; font-family: 'DM Sans', sans-serif;
          font-size: 13px; padding: 9px 14px;
          border-radius: 100px; border: 1px solid var(--border-mid);
          background: var(--bg-subtle); color: var(--text-primary);
          outline: none; transition: border-color 0.2s;
        }
        .reason-input::placeholder { color: var(--text-faint); }
        .reason-input:focus { border-color: rgba(0,0,0,0.3); }
        .update-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; padding: 9px 22px;
          border-radius: 100px; border: none; cursor: pointer;
          background: #E24B4A; color: #fff;
          white-space: nowrap; flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 2px 8px rgba(226,75,74,0.3);
        }
        .update-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(226,75,74,0.4); }
        .update-btn:active { transform: translateY(0); }
        .update-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
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
                    <div className="topbar-title">{feedback.title}</div>
                    <span className="status-badge" style={{ background: ss.bg, color: ss.color }}>
                        {STATUS_LABELS[feedback.status] || feedback.status}
                    </span>
                    {overdue && <span className="overdue-badge">Overdue</span>}
                </div>

                <div className="layout">

                    {/* Sidebar — contact + meta */}
                    <div className="sidebar">

                        {/* Contact */}
                        <div className="contact-block">
                            <div className="contact-avatar">{initials(contact?.name || '')}</div>
                            <div>
                                <div className="contact-name">{contact?.name || 'Unknown'}</div>
                                <div className="contact-email">{contact?.email || '—'}</div>
                                {contact?.company && <div className="contact-email" style={{ marginTop: 2 }}>{contact.company}</div>}
                            </div>
                            {overdue && (
                                <div className="waiting-pill">{waitingDays}d — no reply</div>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="meta-block">
                            <div className="meta-section-label">Details</div>
                            {[
                                { label: 'Type', value: TYPE_LABELS[feedback.category] || feedback.category || '—' },
                                { label: 'Logged', value: getDaysAgo(feedback.createdAt) },
                                { label: 'Segment', value: contact?.segment?.replace(/_/g, ' ') || '—' },
                                { label: 'Logged by', value: feedback.createdBy?.fullname || '—' },
                            ].map(row => (
                                <div key={row.label} className="meta-row">
                                    <span className="meta-key">{row.label}</span>
                                    <span className="meta-val">{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* History */}
                        {history.length > 0 && (
                            <div className="history-block">
                                <div className="meta-section-label">History</div>
                                {history.slice(0, 6).map((h: any, i: number) => (
                                    <div key={i} className="history-entry">
                                        <div>
                                            <span className="history-status">{STATUS_LABELS[h.newStatus] || h.newStatus?.replace(/_/g, ' ')}</span>
                                            {h.changedByUserId?.fullname && <span style={{ color: 'var(--text-faint)' }}> · {h.changedByUserId.fullname}</span>}
                                        </div>
                                        {h.reason && <div className="history-reason">"{h.reason}"</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Main */}
                    <div className="main">
                        <div className="main-scroll">

                            {/* Overdue banner */}
                            {overdue && (
                                <div className="overdue-banner fade-up">
                                    <div className="overdue-dot" />
                                    <div className="overdue-banner-text" style={{ fontSize: 13, color: '#7A1F1F' }}>
                                        <strong>{contact?.name}</strong> has been waiting <strong>{waitingDays} day{waitingDays !== 1 ? 's' : ''}</strong> with no response. Close this loop now.
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            <div className="message-card fade-up">
                                <div className="message-section-label">Their message</div>
                                <div className="message-title">{feedback.title}</div>
                                <div className="message-body">{feedback.description}</div>
                                <div className="message-meta">
                                    {contact?.email && <>{contact.email} · </>}{getDaysAgo(feedback.createdAt)}
                                </div>
                            </div>

                            {/* Closed state */}
                            {closed && (
                                <div className="closed-card fade-up">
                                    <div className="closed-icon">
                                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#2D6B0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 8l3.5 3.5L13 4.5" />
                                        </svg>
                                    </div>
                                    <div className="closed-card-title" style={{ fontSize: 14, fontWeight: 500, color: '#2D6B0A' }}>Loop closed</div>
                                    <div className="closed-card-sub" style={{ fontSize: 13, color: '#3B6D11' }}>
                                        Marked as <strong>{STATUS_LABELS[feedback.status]}</strong>
                                        {history[0]?.reason && ` — "${history[0].reason}"`}
                                    </div>
                                </div>
                            )}

                            {/* Internal notes */}
                            <div className="notes-card fade-up">
                                <div className="notes-header">
                                    <div className="notes-title">Internal notes</div>
                                    <div className="notes-sub">Only visible to your team — not sent to the contact.</div>
                                </div>

                                {comments.length === 0 ? (
                                    <div className="empty-notes">No notes yet. Add one below.</div>
                                ) : comments.map((c: any) => (
                                    <div key={c._id} className="note-row">
                                        <div className="note-avatar">{initials(c.authorUserId?.fullname || '?')}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                                                <span className="note-author">{c.authorUserId?.fullname || 'Team member'}</span>
                                                <span className="note-time">{getTimeStr(c.createdAt)}</span>
                                            </div>
                                            <div className="note-body">{c.comment}</div>
                                        </div>
                                        <button
                                            className="note-delete"
                                            onClick={() => handleDeleteNote(c._id)}
                                            disabled={deletingId === c._id}
                                            title="Delete note"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                                <path d="M3 3l10 10M13 3L3 13" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}

                                <div className="add-note">
                                    <textarea
                                        className="note-textarea"
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostNote(); }}
                                        placeholder="Add an internal note... (⌘+Enter to save)"
                                        rows={2}
                                    />
                                    <button className="add-note-btn" onClick={handlePostNote} disabled={postingNote}>
                                        {postingNote ? 'Saving...' : 'Add note'}
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Status action bar — sticky at bottom */}
                        {!closed && (
                            <div className="action-bar">
                                <div className="action-bar-label">Close the loop</div>
                                <div className="action-bar-row">
                                    <select className="status-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                        {VALID_STATUSES.map(s => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                    {newStatus === 'not_applicable' && (
                                        <input
                                            className="reason-input"
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            placeholder="Why is this not applicable?"
                                        />
                                    )}
                                    <button className="update-btn" onClick={handleUpdateStatus} disabled={updating}>
                                        {updating ? 'Saving...' : 'Update status'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}