import { useState, useEffect } from 'react';
import { sileo } from 'sileo';

type Status = 'idle' | 'loading' | 'done';

declare global {
  interface Window {
    onTurnstileSuccess?: (token: string) => void;
    turnstile?: { reset: (selector: string) => void };
  }
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    window.onTurnstileSuccess = (token: string) => setTurnstileToken(token);
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
      delete window.onTurnstileSuccess;
    };
  }, []);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');

    const promise = fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, turnstileToken }),
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error sending message');
      }
      return res.json();
    });

    sileo.promise(promise, {
      loading: { title: 'Sending signal...' },
      success: { title: 'Signal received', description: "I'll get back to you soon." },
      error:   { title: 'Transmission failed', description: 'Please try again or email me directly.' },
    });

    try {
      await promise;
      setForm({ name: '', email: '', message: '' });
      setTurnstileToken('');
      window.turnstile?.reset('#cf-turnstile');
      setStatus('done');
    } catch {
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '2.5rem',
        background: 'rgba(124,58,237,0.05)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '12px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(167,139,250,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1rem', marginBottom: '0.35rem' }}>Signal received</p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>I'll get back to you soon.</p>
        </div>
        <button
          onClick={() => { setStatus('idle'); setForm({ name: '', email: '', message: '' }); }}
          style={{ fontSize: '0.75rem', color: 'rgba(167,139,250,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.05em' }}
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Your name"
            required
            style={inputStyle}
            onFocus={focusHandler}
            onBlur={blurHandler}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            required
            style={inputStyle}
            onFocus={focusHandler}
            onBlur={blurHandler}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={labelStyle}>Message</label>
        <textarea
          value={form.message}
          onChange={set('message')}
          placeholder="What's on your mind?"
          required
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      </div>

      <div
        id="cf-turnstile"
        className="cf-turnstile"
        data-sitekey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}
        data-callback="onTurnstileSuccess"
        data-theme="dark"
      />

      <button
        type="submit"
        disabled={status === 'loading' || !turnstileToken}
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.75rem',
          background: status === 'loading' ? 'rgba(124,58,237,0.6)' : '#7c3aed',
          color: '#f8fafc',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.925rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s ease, transform 0.2s ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          if (status !== 'loading') {
            (e.currentTarget as HTMLButtonElement).style.background = '#6d28d9';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = status === 'loading' ? 'rgba(124,58,237,0.6)' : '#7c3aed';
          (e.currentTarget as HTMLButtonElement).style.transform = '';
        }}
      >
        {status === 'loading' ? (
          <>
            <SpinnerIcon />
            Sending...
          </>
        ) : (
          <>
            <SendIcon />
            Send message
          </>
        )}
      </button>
    </form>
  );
}

/* ── Estilos ── */
const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const inputStyle: React.CSSProperties = {
  background: '#12121a',
  border: '1px solid #1e1e2e',
  borderRadius: '8px',
  padding: '0.65rem 0.9rem',
  color: '#f1f5f9',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  width: '100%',
};

function focusHandler(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
}
function blurHandler(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = '#1e1e2e';
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" aria-hidden="true"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
