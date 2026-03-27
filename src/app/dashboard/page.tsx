'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFeedback, getDashboard, getRecentActivity } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import PageWrapper from '@/components/PageWrapper';

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

const AVATAR_BG = ['#E6F1FB', '#EEEDFE', '#E1F5EE', '#FAEEDA', '#FBEAF0'];
const AVATAR_FG = ['#185FA5', '#534AB7', '#0F6E56', '#854F0B', '#993556'];

// Smoothly animates a number to its new target value
function useAnimatedNumber(target: number, duration = 700) {
    const [display, setDisplay] = useState(target);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const from = display;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplay(Math.round(from + (target - from) * eased));
            if (progress < 1) rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target]);

    return display;
}

export default function DashboardPage() {
    const router = useRouter();
    const [feedback, setFeedback] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
    const [activeNav, setActiveNav] = useState('Inbox');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const fbRes = await getFeedback();
            setFeedback(fbRes.data.data.feedback || []);
        } catch {
            toast.error('Failed to load conversations');
        }
        getDashboard().then(r => setStats(r.data.data)).catch(() => { });
        getRecentActivity().then(r => setActivity(r.data.data.recentFeedback || [])).catch(() => { });
    };

    const logout = () => { localStorage.removeItem('token'); router.push('/login'); };

    const getDaysAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return '1d ago';
        return `${days}d ago`;
    };

    const isOverdue = (date: string, status: string) => {
        if (status === 'completed' || status === 'wont_do') return false;
        return Math.floor((Date.now() - new Date(date).getTime()) / 86400000) >= 2;
    };
    const isClosed = (s: string) => s === 'completed' || s === 'wont_do';

    const filtered = feedback.filter(f => {
        if (filter === 'open') return !isClosed(f.status);
        if (filter === 'closed') return isClosed(f.status);
        return true;
    });

    const overdueCount = feedback.filter(f => isOverdue(f.createdAt, f.status)).length;
    const closedCount = feedback.filter(f => isClosed(f.status)).length;
    const openCount = feedback.filter(f => !isClosed(f.status)).length;
    const closureRate = feedback.length > 0 ? Math.round((closedCount / feedback.length) * 100) : 0;
    const animatedRate = useAnimatedNumber(closureRate);

    const initials = (name: string) =>
        name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

    return (
        <PageWrapper>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg-page:       #f2f0eb;
          --bg-surface:    #ffffff;
          --bg-subtle:     #f5f4f1;
          --bg-hover:      #faf9f7;
          --border:        rgba(0,0,0,0.07);
          --border-mid:    rgba(0,0,0,0.11);
          --text-primary:  #1a1a18;
          --text-muted:    #6b6a66;
          --text-faint:    #a0a09a;
          --sidebar-w:     216px;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg-page:       #111110;
            --bg-surface:    #1c1c1a;
            --bg-subtle:     #242422;
            --bg-hover:      #282826;
            --border:        rgba(255,255,255,0.07);
            --border-mid:    rgba(255,255,255,0.11);
            --text-primary:  #f0eeea;
            --text-muted:    #8a8880;
            --text-faint:    #58574f;
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
          height: 56px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 20px;
          flex-shrink: 0;
          z-index: 100;
        }
        .topbar-logo {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 500; margin-right: 28px;
          color: var(--text-primary); letter-spacing: -0.01em;
        }
        .topbar-tabs { display: flex; gap: 2px; flex: 1; }
        .topbar-tab {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; padding: 6px 13px; border-radius: 8px;
          border: none; background: none; color: var(--text-muted);
          cursor: pointer; transition: background 0.15s, color 0.15s;
        }
        .topbar-tab:hover { background: var(--bg-subtle); color: var(--text-primary); }
        .topbar-tab.active { background: var(--bg-subtle); color: var(--text-primary); font-weight: 500; }
        .signout-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; padding: 6px 14px; border-radius: 100px;
          border: 1px solid var(--border-mid); background: none;
          color: var(--text-muted); cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .signout-btn:hover { border-color: var(--border-mid); color: var(--text-primary); background: var(--bg-subtle); }

        /* Layout */
        .layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Sidebar — locked in place, never scrolls with content */
        .sidebar {
          width: var(--sidebar-w);
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          padding: 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
          height: 100%;
          overflow-y: auto;
        }
        .sb-section-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.9px;
          color: var(--text-faint); text-transform: uppercase;
          padding: 0 8px; margin: 8px 0 4px;
        }
        .sb-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 7px 10px; border-radius: 8px; font-size: 13px;
          color: var(--text-muted); cursor: pointer;
          transition: background 0.15s, color 0.15s; border: none;
          background: none; font-family: inherit; width: 100%; text-align: left;
        }
        .sb-item:hover { background: var(--bg-subtle); color: var(--text-primary); }
        .sb-item.active { background: var(--bg-subtle); color: var(--text-primary); font-weight: 500; }
        .sb-badge {
          font-size: 11px; font-weight: 500; padding: 1px 7px;
          border-radius: 100px; background: var(--bg-subtle); color: var(--text-muted);
        }
        .sb-badge.danger { background: #FCEBEB; color: #A32D2D; }

        @media (prefers-color-scheme: dark) {
          .sb-badge.danger { background: rgba(226,75,74,0.18); color: #f09595; }
        }

        .log-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; padding: 9px 14px;
          border-radius: 100px; border: none; cursor: pointer;
          margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
          background: var(--text-primary); color: var(--bg-surface);
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .log-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
        .log-btn:active { transform: translateY(0); }

        /* Closure rate block */
        .rate-block {
          margin-top: auto; padding: 14px 8px 4px;
          border-top: 1px solid var(--border);
        }
        .rate-label { font-size: 11px; color: var(--text-faint); margin-bottom: 5px; }
        .rate-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 30px; font-weight: 400; line-height: 1;
          margin-bottom: 8px; color: #3B6D11;
          transition: color 0.4s ease;
        }
        .rate-value.low { color: #D97706; }
        .rate-value.critical { color: #E24B4A; }
        .rate-bar-track { height: 4px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
        .rate-bar-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #639922, #82c22a);
          transition: width 0.7s cubic-bezier(0.16,1,0.3,1), background 0.4s;
        }
        .rate-bar-fill.low { background: linear-gradient(90deg, #D97706, #F59E0B); }
        .rate-bar-fill.critical { background: linear-gradient(90deg, #E24B4A, #F87171); }
        .rate-target { font-size: 10px; color: var(--text-faint); }

        /* Main */
        /* Main — only this scrolls */
        .main { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; min-width: 0; }

        /* Banner */
        .overdue-banner {
          background: #FEF0F0; border: 1px solid rgba(226,75,74,0.2);
          border-radius: 10px; padding: 11px 14px;
          display: flex; align-items: center; gap: 10px;
        }
        @media (prefers-color-scheme: dark) {
          .overdue-banner { background: rgba(226,75,74,0.12); border-color: rgba(226,75,74,0.25); }
          .overdue-banner-text { color: #f09595; }
        }
        .overdue-banner-dot { width: 7px; height: 7px; border-radius: 50%; background: #E24B4A; flex-shrink: 0; }
        .overdue-banner-text { font-size: 13px; color: #7A1F1F; }

        /* Metrics */
        .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
        .metric-card {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 18px 20px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .metric-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .metric-label { font-size: 11px; color: var(--text-faint); margin-bottom: 10px; letter-spacing: 0.01em; }
        .metric-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px; font-weight: 400; line-height: 1;
          color: var(--text-primary);
        }
        .metric-value.danger { color: #E24B4A; }
        .metric-value.success { color: #3B6D11; }
        @media (prefers-color-scheme: dark) {
          .metric-value.success { color: #82c22a; }
          .metric-value.danger  { color: #f09595; }
        }

        /* Two-col */
        .two-col { display: grid; grid-template-columns: 1fr 280px; gap: 14px; align-items: start; }

        /* Inbox */
        .inbox-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .inbox-header {
          padding: 13px 18px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .inbox-title { font-size: 13px; font-weight: 500; }
        .filter-pills { display: flex; gap: 4px; }
        .filter-pill {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; padding: 4px 12px; border-radius: 100px;
          border: 1px solid var(--border-mid); background: none;
          color: var(--text-muted); cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .filter-pill:hover { background: var(--bg-subtle); color: var(--text-primary); }
        .filter-pill.active { background: var(--text-primary); border-color: var(--text-primary); color: var(--bg-surface); font-weight: 500; }

        /* Inbox rows */
        .inbox-row {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 13px 18px; border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background 0.12s;
          border-left: 3px solid transparent;
        }
        .inbox-row:last-child { border-bottom: none; }
        .inbox-row:hover { background: var(--bg-hover); }
        .inbox-row.overdue { border-left-color: #E24B4A; }
        .inbox-row.closed  { border-left-color: #639922; opacity: 0.78; }
        .inbox-row.pending { border-left-color: #D97706; }

        .avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; flex-shrink: 0;
        }
        .row-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .row-snippet {
          font-size: 12.5px; color: var(--text-muted); font-weight: 300;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 3px 0 7px;
        }
        .row-time { font-size: 10.5px; color: var(--text-faint); font-family: 'DM Mono', monospace; }
        .tag-row { display: flex; gap: 5px; flex-wrap: wrap; }
        .tag {
          font-size: 11px; font-weight: 500; padding: 2px 8px;
          border-radius: 100px; letter-spacing: 0.01em;
        }
        .tag-overdue { background: #FCEBEB; color: #A32D2D; }
        .tag-closed  { background: #EAF3DE; color: #2D6B0A; }
        .tag-pending { background: #FEF3C7; color: #92400E; }
        .tag-type    { background: var(--bg-subtle); color: var(--text-muted); }

        @media (prefers-color-scheme: dark) {
          .tag-overdue { background: rgba(226,75,74,0.15); color: #f09595; }
          .tag-closed  { background: rgba(99,153,34,0.15); color: #82c22a; }
          .tag-pending { background: rgba(217,119,6,0.15); color: #fbbf24; }
        }

        /* Activity */
        .activity-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .activity-header { padding: 13px 18px; border-bottom: 1px solid var(--border); font-size: 13px; font-weight: 500; }
        .activity-row {
          display: flex; align-items: flex-start; gap: 11px;
          padding: 11px 18px; border-bottom: 1px solid var(--border);
          transition: background 0.12s;
        }
        .activity-row:last-child { border-bottom: none; }
        .activity-row.clickable { cursor: pointer; }
        .activity-row.clickable:hover { background: var(--bg-hover); }
        .act-icon {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .act-title { font-size: 12.5px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
        .act-time { font-size: 10.5px; color: var(--text-faint); font-family: 'DM Mono', monospace; }

        .empty-state { padding: 48px 24px; text-align: center; font-size: 13px; color: var(--text-faint); font-weight: 300; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up   { animation: fadeUp 0.4s ease both; }
        .fade-up-1 { animation: fadeUp 0.4s 0.07s ease both; }
        .fade-up-2 { animation: fadeUp 0.4s 0.14s ease both; }
      `}</style>

            <div className="lc-shell">
                <Toaster position="top-center" toastOptions={{
                    style: { fontFamily: 'DM Sans, sans-serif', fontSize: 13, borderRadius: 10, background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
                }} />

                {/* Topbar */}
                <div className="topbar">
                    <div className="topbar-logo">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="4" fill="#E24B4A" />
                            <circle cx="9" cy="9" r="8" stroke="#E24B4A" strokeWidth="1" fill="none" opacity="0.3" />
                        </svg>
                        CloseLoop
                    </div>
                    <div className="topbar-tabs">
                        {[
                            { label: 'Inbox', action: () => setActiveNav('Inbox') },
                            { label: 'Analytics', action: () => { setActiveNav('Analytics'); router.push('/analytics'); } },
                            { label: 'Settings', action: () => setActiveNav('Settings') },
                        ].map(({ label, action }) => (
                            <button key={label} className={`topbar-tab${activeNav === label ? ' active' : ''}`} onClick={action}>{label}</button>
                        ))}
                    </div>
                    <button className="signout-btn" onClick={logout}>Sign out</button>
                </div>

                <div className="layout">

                    {/* Sidebar — sticky */}
                    <div className="sidebar">
                        <div className="sb-section-label">Views</div>

                        {([
                            { label: 'All conversations', count: feedback.length, key: 'all' },
                            { label: 'Overdue', count: overdueCount, key: 'overdue', danger: true },
                            { label: 'Resolved', count: closedCount, key: 'closed' },
                        ] as const).map(item => (
                            <button
                                key={item.label}
                                className={`sb-item${filter === (item.key === 'overdue' ? 'open' : item.key) ? ' active' : ''}`}
                                onClick={() => setFilter(item.key === 'overdue' ? 'open' : item.key as any)}
                            >
                                <span>{item.label}</span>
                                {item.count > 0 && (
                                    <span className={`sb-badge${(item as any).danger ? ' danger' : ''}`}>{item.count}</span>
                                )}
                            </button>
                        ))}

                        <button className="log-btn" onClick={() => router.push('/feedback/new')}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            Log conversation
                        </button>

                        {/* Closure rate — animated */}
                        <div className="rate-block">
                            <div className="rate-label">Loop closure rate</div>
                            <div className={`rate-value${animatedRate < 50 ? ' critical' : animatedRate < 75 ? ' low' : ''}`}>
                                {animatedRate}%
                            </div>
                            <div className="rate-bar-track">
                                <div
                                    className={`rate-bar-fill${animatedRate < 50 ? ' critical' : animatedRate < 75 ? ' low' : ''}`}
                                    style={{ width: `${animatedRate}%` }}
                                />
                            </div>
                            <div className="rate-target">Target: 100%</div>
                        </div>
                    </div>

                    {/* Main */}
                    <main className="main">

                        {/* Overdue banner */}
                        {overdueCount > 0 && (
                            <div className="overdue-banner fade-up">
                                <div className="overdue-banner-dot" />
                                <div className="overdue-banner-text">
                                    <strong>{overdueCount} {overdueCount === 1 ? "person hasn't" : "people haven't"} heard back</strong> — waiting over 2 days with no response.
                                </div>
                            </div>
                        )}

                        {/* Metrics */}
                        <div className="metrics-grid fade-up">
                            {[
                                { label: 'Total conversations', value: stats?.totalFeedback ?? feedback.length },
                                { label: 'Loops closed', value: stats?.byStatus?.completed ?? closedCount, cls: 'success' },
                                { label: 'Overdue (2d+)', value: overdueCount, cls: overdueCount > 0 ? 'danger' : '' },
                                // { label: 'Open', value: stats?.byStatus?.new ?? openCount },
                                { label: 'Open', value: openCount },
                            ].map(m => (
                                <div key={m.label} className="metric-card">
                                    <div className="metric-label">{m.label}</div>
                                    <div className={`metric-value${m.cls ? ` ${m.cls}` : ''}`}>{m.value ?? '—'}</div>
                                </div>
                            ))}
                        </div>

                        {/* Inbox + Activity */}
                        <div className="two-col fade-up-2">

                            {/* Inbox */}
                            <div className="inbox-card">
                                <div className="inbox-header">
                                    <span className="inbox-title">Conversations</span>
                                    <div className="filter-pills">
                                        {(['all', 'open', 'closed'] as const).map(f => (
                                            <button key={f} className={`filter-pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {filtered.length === 0 ? (
                                    <div className="empty-state">Nothing here. All loops closed ✓</div>
                                ) : filtered.map((f, i) => {
                                    const overdue = isOverdue(f.createdAt, f.status);
                                    const closed = isClosed(f.status);
                                    const ci = i % AVATAR_BG.length;
                                    return (
                                        <div
                                            key={f._id}
                                            className={`inbox-row${overdue ? ' overdue' : closed ? ' closed' : ' pending'}`}
                                            onClick={() => router.push(`/feedback/${f._id}`)}
                                        >
                                            <div className="avatar" style={{ background: AVATAR_BG[ci], color: AVATAR_FG[ci] }}>
                                                {initials(f.customerId?.name || 'U')}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                                    <span className="row-name">{f.customerId?.name || 'Unknown'}</span>
                                                    <span className="row-time">{getDaysAgo(f.createdAt)}</span>
                                                </div>
                                                <div className="row-snippet">{f.title || f.description || 'No message'}</div>
                                                <div className="tag-row">
                                                    {overdue && <span className="tag tag-overdue">{Math.floor((Date.now() - new Date(f.createdAt).getTime()) / 86400000)}d — no reply</span>}
                                                    {closed && <span className="tag tag-closed">Loop closed</span>}
                                                    {!overdue && !closed && <span className="tag tag-pending">Awaiting reply</span>}
                                                    {f.category && <span className="tag tag-type">{TYPE_LABELS[f.category] || f.category?.replace(/_/g, ' ')}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Activity */}
                            <div className="activity-card">
                                <div className="activity-header">Recent activity</div>
                                {activity.length === 0 ? (
                                    <div className="empty-state">No activity yet</div>
                                ) : activity.slice(0, 8).map((a: any, i: number) => {
                                    const closed = isClosed(a.status);
                                    const overdue = isOverdue(a.updatedAt || a.createdAt, a.status);
                                    const iconBg = closed ? '#EAF3DE' : overdue ? '#FCEBEB' : '#E6F1FB';
                                    const iconStroke = closed ? '#2D6B0A' : overdue ? '#A32D2D' : '#185FA5';
                                    return (
                                        <div
                                            key={i}
                                            className={`activity-row${a._id ? ' clickable' : ''}`}
                                            onClick={() => a._id && router.push(`/feedback/${a._id}`)}
                                        >
                                            <div className="act-icon" style={{ background: iconBg }}>
                                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={iconStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    {closed
                                                        ? <path d="M3 8l3.5 3.5L13 4.5" />
                                                        : overdue
                                                            ? <><circle cx="8" cy="8" r="6" /><path d="M8 5v3.5l2 1.5" /></>
                                                            : <><path d="M2 4l6 5 6-5" /><rect x="2" y="3" width="12" height="10" rx="1.5" /></>
                                                    }
                                                </svg>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="act-title">{a.title || 'Feedback updated'}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span className="act-time">{getDaysAgo(a.updatedAt || a.createdAt)}</span>
                                                    {a.status && (
                                                        <span className="tag tag-type" style={{ fontSize: 10 }}>
                                                            {a.status.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </PageWrapper>
    );
}