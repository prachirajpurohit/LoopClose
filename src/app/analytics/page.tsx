'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboard, getRecentActivity, getFeedback } from '@/lib/api';
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

export default function AnalyticsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [feedback, setFeedback] = useState<any[]>([]);
    const lineRef = useRef<HTMLCanvasElement>(null);
    const donutRef = useRef<HTMLCanvasElement>(null);
    const lineChart = useRef<any>(null);
    const donutChart = useRef<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const fbRes = await getFeedback();
            setFeedback(fbRes.data.data.feedback || []);
        } catch { console.warn('feedback unavailable'); }
        try {
            const statsRes = await getDashboard();
            setStats(statsRes.data.data || {});
        } catch { console.warn('stats unavailable'); }
    };

    // Build charts once data is ready
    useEffect(() => {
        if (!stats) return;
        if (typeof window === 'undefined') return;

        // Detect dark mode for chart colors
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const gridColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        const tickColor = dark ? '#58574f' : '#a0a09a';
        const chartBg = dark ? '#1c1c1a' : '#ffffff';

        import('chart.js/auto').then(({ default: Chart }) => {

            // Donut — by status
            if (donutRef.current) {
                if (donutChart.current) donutChart.current.destroy();
                const byStatus = stats.byStatus || {};
                const labels = Object.keys(byStatus);
                const data = Object.values(byStatus) as number[];
                const colors = ['#378ADD', '#7F77DD', '#1D9E75', '#EF9F27', '#639922', '#888780'];
                donutChart.current = new Chart(donutRef.current, {
                    type: 'doughnut',
                    data: {
                        labels,
                        datasets: [{
                            data,
                            backgroundColor: colors.slice(0, labels.length),
                            borderWidth: 2,
                            borderColor: chartBg,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: { legend: { display: false } },
                    }
                });
            }

            // Line — submissions last 7 days
            if (lineRef.current) {
                if (lineChart.current) lineChart.current.destroy();
                const days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                const counts = days.map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return feedback.filter(f => new Date(f.createdAt).toDateString() === d.toDateString()).length;
                });
                lineChart.current = new Chart(lineRef.current, {
                    type: 'line',
                    data: {
                        labels: days,
                        datasets: [{
                            label: 'Conversations',
                            data: counts,
                            borderColor: '#639922',
                            backgroundColor: dark ? 'rgba(99,153,34,0.12)' : 'rgba(99,153,34,0.08)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointBackgroundColor: '#639922',
                            pointBorderColor: chartBg,
                            pointBorderWidth: 2,
                            fill: true,
                            tension: 0.4,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: tickColor } },
                            y: { grid: { color: gridColor }, ticks: { font: { size: 11 }, color: tickColor, stepSize: 1 }, min: 0 },
                        }
                    }
                });
            }
        });
    }, [stats, feedback]);

    const isClosed = (s: string) => s === 'completed' || s === 'wont_do';
    const isOverdue = (f: any) => {
        if (isClosed(f.status)) return false;
        return Math.floor((Date.now() - new Date(f.createdAt).getTime()) / 86400000) >= 2;
    };

    const closureRate = feedback.length > 0
        ? Math.round((feedback.filter(f => isClosed(f.status)).length / feedback.length) * 100)
        : 0;
    const overdueCount = feedback.filter(isOverdue).length;
    const openCount = feedback.filter(f => !isClosed(f.status)).length;

    const avgResponseDays = (() => {
        const closed = feedback.filter(f => isClosed(f.status));
        if (!closed.length) return '—';
        const avg = closed.reduce((sum, f) =>
            sum + Math.floor((Date.now() - new Date(f.createdAt).getTime()) / 86400000), 0
        ) / closed.length;
        return avg.toFixed(1) + 'd';
    })();

    const initials = (name: string) =>
        name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

    const logout = () => { localStorage.removeItem('token'); router.push('/login'); };

    const STATUS_COLORS = ['#378ADD', '#7F77DD', '#1D9E75', '#EF9F27', '#639922', '#888780'];

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
          --border-mid: rgba(0,0,0,0.11);
          --text-primary: #1a1a18;
          --text-muted:   #6b6a66;
          --text-faint:   #a0a09a;
          --sidebar-w:    216px;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-page:    #111110;
            --bg-surface: #1c1c1a;
            --bg-subtle:  #242422;
            --bg-hover:   #282826;
            --border:     rgba(255,255,255,0.07);
            --border-mid: rgba(255,255,255,0.11);
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
          display: flex; align-items: center; padding: 0 20px;
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
        .signout-btn:hover { color: var(--text-primary); background: var(--bg-subtle); }

        /* Layout */
        .layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
          width: var(--sidebar-w); flex-shrink: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          padding: 16px 10px;
          display: flex; flex-direction: column; gap: 2px;
          height: 100%; overflow-y: auto;
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
          transition: transform 0.15s, box-shadow 0.2s;
          background: var(--text-primary); color: var(--bg-surface);
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .log-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
        .log-btn:active { transform: translateY(0); }
        .rate-block {
          margin-top: auto; padding: 14px 8px 4px;
          border-top: 1px solid var(--border);
        }
        .rate-label { font-size: 11px; color: var(--text-faint); margin-bottom: 5px; }
        .rate-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 30px; font-weight: 400; line-height: 1;
          margin-bottom: 8px; color: #3B6D11; transition: color 0.4s;
        }
        .rate-value.low { color: #D97706; }
        .rate-value.critical { color: #E24B4A; }
        .rate-bar-track { height: 4px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
        .rate-bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #639922, #82c22a); transition: width 0.7s cubic-bezier(0.16,1,0.3,1); }
        .rate-bar-fill.low { background: linear-gradient(90deg, #D97706, #F59E0B); }
        .rate-bar-fill.critical { background: linear-gradient(90deg, #E24B4A, #F87171); }
        .rate-target { font-size: 10px; color: var(--text-faint); }

        /* Main — only this scrolls */
        .main { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; min-width: 0; }

        /* Metrics */
        .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
        .metric-card {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 18px 20px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .metric-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .metric-label { font-size: 11px; color: var(--text-faint); margin-bottom: 10px; }
        .metric-value {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px; font-weight: 400; line-height: 1; color: var(--text-primary);
        }
        .metric-value.success { color: #3B6D11; }
        .metric-value.danger  { color: #E24B4A; }
        @media (prefers-color-scheme: dark) {
          .metric-value.success { color: #82c22a; }
          .metric-value.danger  { color: #f09595; }
        }

        /* Panels */
        .panel {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
        }
        .panel-head {
          padding: 13px 18px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .panel-title { font-size: 13px; font-weight: 500; }
        .panel-sub { font-size: 11px; color: var(--text-faint); font-family: 'DM Mono', monospace; }
        .panel-body { padding: 18px; }

        /* Charts grid */
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* Status legend */
        .legend { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
        .legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted); }
        .legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

        /* Category bars */
        .cat-row { display: flex; flex-direction: column; gap: 5px; }
        .cat-labels { display: flex; justify-content: space-between; font-size: 12.5px; }
        .cat-name { color: var(--text-primary); }
        .cat-count { font-family: 'DM Mono', monospace; font-weight: 500; color: var(--text-muted); }
        .cat-track { height: 5px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden; }
        .cat-fill { height: 100%; background: #639922; border-radius: 4px; transition: width 0.6s cubic-bezier(0.16,1,0.3,1); }

        /* Waiting list */
        .waiting-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 18px; border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background 0.12s;
        }
        .waiting-row:last-child { border-bottom: none; }
        .waiting-row:hover { background: var(--bg-hover); }
        .waiting-num { font-size: 11px; font-weight: 500; font-family: 'DM Mono', monospace; color: var(--text-faint); width: 16px; }
        .waiting-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; flex-shrink: 0; }
        .waiting-name { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary); }
        .waiting-days { font-size: 12px; font-family: 'DM Mono', monospace; font-weight: 500; }
        .waiting-days.overdue { color: #E24B4A; }
        .waiting-days.ok { color: #D97706; }

        /* Insights */
        .insight {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 11px 14px; border-radius: 10px; margin-bottom: 8px;
          border: 1px solid transparent;
        }
        .insight:last-child { margin-bottom: 0; }
        .insight-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .insight-text { font-size: 12.5px; line-height: 1.6; }
        .insight.danger { background: #FEF0F0; border-color: rgba(226,75,74,0.15); }
        .insight.danger .insight-dot { background: #E24B4A; }
        .insight.danger .insight-text { color: #7A1F1F; }
        .insight.success { background: #EDF6E4; border-color: rgba(99,153,34,0.15); }
        .insight.success .insight-dot { background: #639922; }
        .insight.success .insight-text { color: #1F5A0A; }
        .insight.warning { background: #FDF4E7; border-color: rgba(239,159,39,0.15); }
        .insight.warning .insight-dot { background: #EF9F27; }
        .insight.warning .insight-text { color: #633806; }
        @media (prefers-color-scheme: dark) {
          .insight.danger  { background: rgba(226,75,74,0.1);  border-color: rgba(226,75,74,0.2);  }
          .insight.danger  .insight-text { color: #f09595; }
          .insight.success { background: rgba(99,153,34,0.1);  border-color: rgba(99,153,34,0.2);  }
          .insight.success .insight-text { color: #82c22a; }
          .insight.warning { background: rgba(239,159,39,0.1); border-color: rgba(239,159,39,0.2); }
          .insight.warning .insight-text { color: #fbbf24; }
        }

        .empty-state { padding: 40px 24px; text-align: center; font-size: 13px; color: var(--text-faint); font-weight: 300; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up   { animation: fadeUp 0.4s ease both; }
        .fade-up-1 { animation: fadeUp 0.4s 0.07s ease both; }
        .fade-up-2 { animation: fadeUp 0.4s 0.14s ease both; }
        .fade-up-3 { animation: fadeUp 0.4s 0.21s ease both; }
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
                            { label: 'Inbox', action: () => router.push('/dashboard') },
                            { label: 'Analytics', action: () => { } },
                            { label: 'Settings', action: () => { } },
                        ].map(({ label, action }) => (
                            <button key={label} className={`topbar-tab${label === 'Analytics' ? ' active' : ''}`} onClick={action}>{label}</button>
                        ))}
                    </div>
                    <button className="signout-btn" onClick={logout}>Sign out</button>
                </div>

                <div className="layout">

                    {/* Sidebar — same as dashboard */}
                    <div className="sidebar">
                        <div className="sb-section-label">Views</div>
                        {[
                            { label: 'All conversations', count: feedback.length },
                            { label: 'Overdue', count: overdueCount, danger: true },
                            { label: 'Resolved', count: feedback.filter(f => isClosed(f.status)).length },
                        ].map(item => (
                            <button key={item.label} className="sb-item" onClick={() => router.push('/dashboard')}>
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

                        <div className="rate-block">
                            <div className="rate-label">Loop closure rate</div>
                            <div className={`rate-value${closureRate < 50 ? ' critical' : closureRate < 75 ? ' low' : ''}`}>
                                {closureRate}%
                            </div>
                            <div className="rate-bar-track">
                                <div className={`rate-bar-fill${closureRate < 50 ? ' critical' : closureRate < 75 ? ' low' : ''}`} style={{ width: `${closureRate}%` }} />
                            </div>
                            <div className="rate-target">Target: 100%</div>
                        </div>
                    </div>

                    {/* Main — only this scrolls */}
                    <main className="main">

                        {/* Metrics */}
                        <div className="metrics-grid fade-up">
                            {[
                                { label: 'Loop closure rate', value: `${closureRate}%`, cls: closureRate === 100 ? 'success' : closureRate < 50 ? 'danger' : '' },
                                { label: 'Avg. response time', value: avgResponseDays },
                                { label: 'Overdue (2d+)', value: overdueCount, cls: overdueCount > 0 ? 'danger' : '' },
                                { label: 'Total conversations', value: stats?.totalFeedback ?? feedback.length },
                            ].map(m => (
                                <div key={m.label} className="metric-card">
                                    <div className="metric-label">{m.label}</div>
                                    <div className={`metric-value${m.cls ? ` ${m.cls}` : ''}`}>{m.value ?? '—'}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="charts-grid fade-up-1">

                            {/* Line chart */}
                            <div className="panel">
                                <div className="panel-head">
                                    <span className="panel-title">Conversations over time</span>
                                    <span className="panel-sub">last 7 days</span>
                                </div>
                                <div className="panel-body">
                                    <div style={{ position: 'relative', height: 200 }}>
                                        <canvas ref={lineRef} />
                                    </div>
                                </div>
                            </div>

                            {/* Donut chart */}
                            <div className="panel">
                                <div className="panel-head">
                                    <span className="panel-title">Breakdown by status</span>
                                    <span className="panel-sub">all time</span>
                                </div>
                                <div className="panel-body">
                                    <div className="legend">
                                        {Object.entries(stats?.byStatus || {}).map(([key, val], i) => (
                                            <div key={key} className="legend-item">
                                                <div className="legend-dot" style={{ background: STATUS_COLORS[i] }} />
                                                {key.replace('_', ' ')} <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ position: 'relative', height: 160 }}>
                                        <canvas ref={donutRef} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom row */}
                        <div className="charts-grid fade-up-2">

                            {/* By category */}
                            <div className="panel">
                                <div className="panel-head">
                                    <span className="panel-title">Conversations by type</span>
                                    <span className="panel-sub">all time</span>
                                </div>
                                <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {Object.entries(stats?.byCategory || {}).length === 0 ? (
                                        <div className="empty-state" style={{ padding: '20px 0' }}>No category data yet</div>
                                    ) : Object.entries(stats?.byCategory || {}).map(([cat, count]) => {
                                        const total = stats?.totalFeedback || 1;
                                        const pct = Math.round((Number(count) / total) * 100);
                                        return (
                                            <div key={cat} className="cat-row">
                                                <div className="cat-labels">
                                                    <span className="cat-name">{TYPE_LABELS[cat] || cat.replace(/_/g, ' ')}</span>
                                                    <span className="cat-count">{String(count)}</span>
                                                </div>
                                                <div className="cat-track">
                                                    <div className="cat-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Longest waiting */}
                            <div className="panel">
                                <div className="panel-head">
                                    <span className="panel-title">Longest waiting</span>
                                    <span className="panel-sub">needs action</span>
                                </div>
                                {feedback.filter(f => !isClosed(f.status)).length === 0 ? (
                                    <div className="empty-state">All loops closed ✓</div>
                                ) : (
                                    feedback
                                        .filter(f => !isClosed(f.status))
                                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                        .slice(0, 5)
                                        .map((f, i) => {
                                            const days = Math.floor((Date.now() - new Date(f.createdAt).getTime()) / 86400000);
                                            return (
                                                <div key={f._id} className="waiting-row" onClick={() => router.push(`/feedback/${f._id}`)}>
                                                    <div className="waiting-num">{i + 1}</div>
                                                    <div className="waiting-avatar" style={{ background: AVATAR_BG[i % 5], color: AVATAR_FG[i % 5] }}>
                                                        {initials(f.customerId?.name || 'U')}
                                                    </div>
                                                    <div className="waiting-name">{f.customerId?.name || 'Unknown'}</div>
                                                    <div className={`waiting-days${days >= 2 ? ' overdue' : ' ok'}`}>
                                                        {days === 0 ? 'today' : `${days}d`}
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="panel fade-up-3">
                            <div className="panel-head">
                                <span className="panel-title">Insights</span>
                                <span className="panel-sub">auto-generated</span>
                            </div>
                            <div className="panel-body">
                                {feedback.length === 0 && (
                                    <div className="empty-state" style={{ padding: '16px 0' }}>No conversations yet — insights will appear as data comes in.</div>
                                )}
                                {overdueCount > 0 && (
                                    <div className="insight danger">
                                        <div className="insight-dot" />
                                        <div className="insight-text">
                                            <strong>{overdueCount} conversation{overdueCount > 1 ? 's are' : ' is'} overdue</strong> — {overdueCount > 1 ? 'these people have' : 'this person has'} been waiting over 2 days. Go to the inbox and close these loops now.
                                        </div>
                                    </div>
                                )}
                                {closureRate === 100 && feedback.length > 0 && (
                                    <div className="insight success">
                                        <div className="insight-dot" />
                                        <div className="insight-text">
                                            <strong>100% closure rate!</strong> Every loop is closed. This is exactly what good communication looks like.
                                        </div>
                                    </div>
                                )}
                                {closureRate < 100 && closureRate >= 50 && feedback.length > 0 && (
                                    <div className="insight warning">
                                        <div className="insight-dot" />
                                        <div className="insight-text">
                                            <strong>Closure rate is at {closureRate}%</strong> — getting there! {openCount} conversation{openCount > 1 ? 's' : ''} still open.
                                        </div>
                                    </div>
                                )}
                                {closureRate < 50 && feedback.length > 0 && (
                                    <div className="insight danger">
                                        <div className="insight-dot" />
                                        <div className="insight-text">
                                            <strong>Closure rate is below 50%</strong> — more than half of conversations haven't been responded to. Start with the oldest ones in the inbox.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </main>
                </div>
            </div>
        </PageWrapper>
    );
}