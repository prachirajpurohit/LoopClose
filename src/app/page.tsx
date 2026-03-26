'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ping } from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    ping();
  }, []);

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: '#f8f7f4', color: '#1a1a18', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 26px;
          border-radius: 100px;
          background: #1a1a18;
          color: #f8f7f4;
          border: none;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.01em;
          transition: background 0.25s ease, transform 0.18s ease, box-shadow 0.25s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s ease;
        }
        .btn-primary:hover {
          background: #2e2e2a;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }
        .btn-primary:active {
          transform: translateY(0px);
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 400;
          padding: 12px 24px;
          border-radius: 100px;
          background: transparent;
          color: #1a1a18;
          border: 1px solid rgba(0,0,0,0.18);
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.01em;
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.18s ease;
        }
        .btn-secondary:hover {
          border-color: rgba(0,0,0,0.4);
          background: rgba(0,0,0,0.03);
          transform: translateY(-1px);
        }
        .btn-secondary:active { transform: translateY(0px); }

        .btn-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 500;
          padding: 14px 32px;
          border-radius: 100px;
          background: #E24B4A;
          color: #fff;
          border: none;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.01em;
          transition: background 0.25s ease, transform 0.18s ease, box-shadow 0.25s ease;
          box-shadow: 0 2px 12px rgba(226,75,74,0.3);
        }
        .btn-cta:hover {
          background: #ce3b3a;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(226,75,74,0.4);
        }
        .btn-cta:active {
          transform: translateY(0px);
          box-shadow: 0 2px 8px rgba(226,75,74,0.2);
        }

        .btn-nav-sign-in {
          font-size: 13px;
          font-weight: 500;
          padding: 7px 18px;
          border-radius: 100px;
          background: #1a1a18;
          color: #f8f7f4;
          border: none;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.01em;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .btn-nav-sign-in:hover {
          background: #2e2e2a;
          transform: translateY(-1px);
        }
        .btn-nav-sign-in:active { transform: translateY(0); }

        .feature-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 16px;
          padding: 28px;
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
          cursor: default;
        }
        .feature-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          transform: translateY(-3px);
          border-color: rgba(0,0,0,0.1);
        }

        .stat-card {
          text-align: center;
          padding: 40px 28px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 16px;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .stat-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .nav-wrapper {
          background: rgba(248, 247, 244, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding: 0 48px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          transition: box-shadow 0.3s ease;
        }
        .nav-wrapper.scrolled {
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FCEBEB;
          color: #9B2C2C;
          font-size: 12px;
          font-weight: 500;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
          letter-spacing: 0.01em;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-animate {
          animation: fadeUp 0.7s ease forwards;
        }
        .hero-animate-delay-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .hero-animate-delay-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .hero-animate-delay-3 { animation: fadeUp 0.7s 0.35s ease both; }

        .grain-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .divider { height: 1px; background: rgba(0,0,0,0.06); }

        .mono { font-family: 'DM Mono', monospace; }

        @media (max-width: 760px) {
          .nav-wrapper { padding: 0 20px; }
          .hero-section { padding: 60px 24px 48px; }
          .section-pad { padding: 48px 24px; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Nav */}
      <nav className={`nav-wrapper${scrolled ? ' scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="4" fill="#E24B4A" />
            <circle cx="9" cy="9" r="8" stroke="#E24B4A" strokeWidth="1" fill="none" opacity="0.3" />
          </svg>
          CloseLoop
        </div>
        <button className="btn-nav-sign-in" onClick={() => {
          const token = localStorage.getItem('token');
          router.push(token ? '/dashboard' : '/login');
        }}>Sign in</button>
      </nav>

      {/* Hero */}
      <div className="hero-section" ref={heroRef} style={{ padding: '96px 48px 80px', maxWidth: 940, margin: '0 auto', textAlign: 'center' }}>
        <div className="pill-badge hero-animate">
          <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="#E24B4A" /></svg>
          Built for teams who care about people
        </div>
        <h1 className="hero-animate-delay-1" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(38px, 6vw, 60px)', lineHeight: 1.12, color: '#1a1a18', marginBottom: 24, letterSpacing: '-0.02em', fontWeight: 400 }}>
          Nobody should fall through<br />
          the <span style={{ color: '#E24B4A', fontStyle: 'italic' }}>cracks.</span>
        </h1>
        <p className="hero-animate-delay-2" style={{ fontSize: 17, color: '#6b6a66', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 44px', fontWeight: 300 }}>
          CloseLoop makes sure every person who reaches out gets a response — automatically tracking, flagging, and closing communication loops so nothing gets missed.
        </p>
        <div className="hero-animate-delay-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => {
            const token = localStorage.getItem('token');
            router.push(token ? '/dashboard' : '/login');
          }}>
            Get started
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="btn-secondary" onClick={() => {
            const token = localStorage.getItem('token');
            router.push(token ? '/dashboard' : '/login');
          }}>
            View demo
          </button>
        </div>
      </div>

      <div className="divider" />

      {/* Quote */}
      <div style={{ background: '#1c1c1a', padding: '72px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,75,74,0.08) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <div className="mono" style={{ fontSize: 10, color: '#666460', letterSpacing: '1.2px', marginBottom: 24, textTransform: 'uppercase' }}>The Problem — In Your Own Words</div>
          <div style={{ width: 32, height: 2, background: '#E24B4A', marginBottom: 28, borderRadius: 2 }} />
          <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(18px, 2.5vw, 23px)', lineHeight: 1.65, color: '#e8e6e2', marginBottom: 24, fontWeight: 400 }}>
            "She spent 5 days filling in our form, and then{' '}
            <em style={{ color: '#E87271' }}>she didn't hear anything from us.</em>{' '}
            We didn't NOT want to communicate. We just assumed we had closed the loop. But we didn't."
          </p>
          <div style={{ fontSize: 13, color: '#666460', letterSpacing: '0.02em' }}>— A real story from a hiring team. It happens every day.</div>
        </div>
      </div>

      {/* Features */}
      <div className="section-pad" style={{ padding: '80px 48px', maxWidth: 1000, margin: '0 auto' }}>
        <div className="mono" style={{ fontSize: 10, color: '#888780', letterSpacing: '1.2px', marginBottom: 12, textTransform: 'uppercase' }}>What CloseLoop Does</div>
        <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(24px, 3.5vw, 34px)', color: '#1a1a18', marginBottom: 48, lineHeight: 1.2, fontWeight: 400 }}>
          Every loop, closed.<br />No exceptions.
        </div>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 16 }}>
          {[
            { icon: '⏱', bg: '#FEF0F0', iconColor: '#E24B4A', title: 'Overdue detection', desc: 'Automatically flags anyone who hasn\'t received a reply in your defined window — before it becomes a problem.' },
            { icon: '✉', bg: '#EDF4FD', iconColor: '#3B82C4', title: 'Auto follow-ups', desc: 'Send acknowledgements and reminders automatically — so no one wonders if their message was received.' },
            { icon: '✓', bg: '#EDF6E4', iconColor: '#4A9020', title: 'One-click close', desc: 'Reply and mark a loop closed in a single action. Internal notes, full history — all in one place.' },
            { icon: '▦', bg: '#EEEDFE', iconColor: '#6C63FF', title: 'Closure rate dashboard', desc: 'Track your team\'s response rate over time. See trends, find gaps, and measure the impact of closing loops.' },
            { icon: '◎', bg: '#FDF4E7', iconColor: '#C97B1A', title: 'Auto-generated insights', desc: 'CloseLoop tells you where the slowdowns are — which types take longest, and what\'s driving improvement.' },
            { icon: '↗', bg: '#E8F7F1', iconColor: '#1A8A5A', title: 'Simple to use', desc: 'Built for humans, not developers. If your team can use email, they can use CloseLoop. No training required.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 17 }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#6b6a66', lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Before / After */}
      <div style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="mono" style={{ fontSize: 10, color: '#888780', letterSpacing: '1.2px', marginBottom: 40, textTransform: 'uppercase', textAlign: 'center' }}>The Before & After</div>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FEF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E24B4A' }} />
                </div>
                <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 20, fontWeight: 400 }}>Without CloseLoop</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'People reach out and hear nothing back for days',
                  'Teams assume someone else responded — nobody did',
                  'No visibility into who\'s still waiting or for how long',
                  'Your culture values people — but the system doesn\'t show it',
                ].map(text => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, background: '#FEF5F5', border: '1px solid rgba(226,75,74,0.1)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 2, flexShrink: 0 }}><circle cx="7" cy="7" r="6" stroke="#E24B4A" strokeWidth="1.2" /><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#E24B4A" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    <div style={{ fontSize: 13, color: '#7A2020', lineHeight: 1.6, fontWeight: 300 }}>{text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EDF6E4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4A9020' }} />
                </div>
                <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 20, fontWeight: 400 }}>With CloseLoop</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Every message is acknowledged within hours, automatically',
                  'Overdue threads are flagged before anyone has to follow up',
                  'Full visibility — who\'s waiting, who\'s been responded to',
                  'Your values show up in every single interaction',
                ].map(text => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, background: '#F3FAF0', border: '1px solid rgba(74,144,32,0.1)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 2, flexShrink: 0 }}><circle cx="7" cy="7" r="6" stroke="#4A9020" strokeWidth="1.2" /><path d="M4.5 7l2 2 3.5-3.5" stroke="#4A9020" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div style={{ fontSize: 13, color: '#1F5A0A', lineHeight: 1.6, fontWeight: 300 }}>{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="section-pad" style={{ padding: '80px 48px', maxWidth: 1000, margin: '0 auto' }}>
        <div className="mono" style={{ fontSize: 10, color: '#888780', letterSpacing: '1.2px', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase' }}>By the Numbers</div>
        <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(24px, 3.5vw, 34px)', textAlign: 'center', marginBottom: 48, fontWeight: 400 }}>The cost of a missed loop</div>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20 }}>
          {[
            { num: '5', unit: 'days', desc: 'Average time a person waits before giving up on ever hearing back' },
            { num: '68', unit: '%', desc: 'Of people who don\'t hear back say it permanently changes their view of that organisation' },
            { num: '3×', unit: '', desc: 'More likely to re-engage when they receive even a simple acknowledgement within 24 hours' },
          ].map(s => (
            <div key={s.num} className="stat-card">
              <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 52, color: '#1a1a18', lineHeight: 1, marginBottom: 10, fontWeight: 400 }}>
                <span style={{ color: '#E24B4A' }}>{s.num}</span>
                <span style={{ fontSize: 28 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 13, color: '#6b6a66', lineHeight: 1.65, fontWeight: 300 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#1c1c1a', padding: '96px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,75,74,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 40, height: 2, background: '#E24B4A', margin: '0 auto 32px', borderRadius: 2 }} />
          <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', color: '#f0eeea', marginBottom: 18, lineHeight: 1.15, fontWeight: 400 }}>Ready to close every loop?</div>
          <p style={{ fontSize: 15, color: '#7a7872', marginBottom: 40, lineHeight: 1.7, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto', fontWeight: 300 }}>
            Built on a live backend. Ready to connect to your forms, inboxes, and workflows today.
          </p>
          <button className="btn-cta" onClick={() => {
            const token = localStorage.getItem('token');
            router.push(token ? '/dashboard' : '/login');
          }}>
            Get started free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ fontSize: 12, color: '#4a4944', marginTop: 20, letterSpacing: '0.01em' }}>
            No sales pitch. Just a live walkthrough of your actual pain point, solved.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 48px', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em' }}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="4" fill="#E24B4A" />
            <circle cx="9" cy="9" r="8" stroke="#E24B4A" strokeWidth="1" fill="none" opacity="0.3" />
          </svg>
          CloseLoop
        </div>
        <div style={{ fontSize: 12, color: '#a0a09a', letterSpacing: '0.01em' }}>Built to make sure nobody gets left behind.</div>
      </div>
    </div>
  );
}