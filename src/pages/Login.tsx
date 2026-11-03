import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { LANDING } from '../lib/nav';
import { ORGS, useSession, type Role } from '../lib/session';

const ORG_META: Record<string, { projects: string; role: string; due: string; tone: 'bad' | 'warn' | 'none' }> = {
  saffron: { projects: 'Saffron Residencia (Lahore) · Saffron Gardens (Islamabad) · last used today', role: 'Agent', due: '7 calls due now', tone: 'bad' },
  margalla: { projects: 'Crest Heights Tower B (Islamabad) · last used 2 days ago', role: 'Agent', due: '2 follow-ups today', tone: 'warn' },
  rawal: { projects: 'Rawal Enclave Phase II (Rawalpindi) · last used 3 weeks ago', role: 'Dealer', due: 'Nothing due', tone: 'none' },
};

export function Login() {
  const s = useSession();
  const nav = useNavigate();
  const [method, setMethod] = useState<'otp' | 'email'>('otp');
  const [verified, setVerified] = useState(false);
  const [filter, setFilter] = useState('');
  const [seconds, setSeconds] = useState(42);
  const [phone, setPhone] = useState('300 512 3478');
  const [otp, setOtp] = useState('48291');

  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((x) => x - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const orgs = ORGS.filter((o) => o.name.toLowerCase().includes(filter.toLowerCase()));

  const choose = (id: string) => {
    const role: Role = ORG_META[id]?.role === 'Dealer' ? 'dealer' : 'agent';
    s.setRole(role);
    s.signIn(id);
    nav(LANDING[role]);
  };

  return (
    <div className="login">
      <div className="login__bar">
        <span className="logo-mark logo-mark--on-light">E</span>
        <span className="logo-word">Ehata</span>
        <span className="spacer" />
        <button type="button" className="btn btn--secondary btn--sm" style={{ fontWeight: 500 }}>
          English · <span lang="ur">اردو</span>
        </button>
      </div>
      <div className="login__body">
        <section aria-labelledby="s1" className="panel login__card" style={{ flexBasis: 400, maxWidth: 440 }}>
          <div className="stack-1">
            <span className="t-label">Step 1 of 2</span>
            <h1 id="s1" className="t-h1">
              Sign in
            </h1>
          </div>
          <div role="tablist" className="login__method">
            <button type="button" role="tab" aria-selected={method === 'otp'} onClick={() => setMethod('otp')}>
              Mobile + OTP
            </button>
            <button type="button" role="tab" aria-selected={method === 'email'} onClick={() => setMethod('email')}>
              Email + password
            </button>
          </div>
          <form
            className="stack-4"
            onSubmit={(e) => {
              e.preventDefault();
              setVerified(true);
            }}
          >
            {method === 'otp' ? (
              <>
                <div className="field">
                  <label htmlFor="lg-ph" className="field__label">
                    Mobile number
                  </label>
                  <div className="row">
                    <span className="login__prefix">+92</span>
                    <input id="lg-ph" className="input input--lg" style={{ flex: 1, fontSize: 16 }} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="lg-otp" className="field__label">
                    6-digit code sent by SMS
                  </label>
                  <input
                    id="lg-otp"
                    className="input input--lg login__otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <span className="field__hint">
                    {seconds > 0 ? `Resend in 0:${String(seconds).padStart(2, '0')}` : (
                      <button type="button" className="linklike" onClick={() => setSeconds(42)}>
                        Resend code
                      </button>
                    )}{' '}
                    · <a href="#whatsapp">Send on WhatsApp instead</a>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="lg-em" className="field__label">
                    Work email
                  </label>
                  <input id="lg-em" type="email" className="input input--lg" defaultValue="usman@saffrondev.pk" />
                </div>
                <div className="field">
                  <label htmlFor="lg-pw" className="field__label">
                    Password
                  </label>
                  <input id="lg-pw" type="password" className="input input--lg" defaultValue="password" />
                  <span className="field__hint">
                    <a href="#reset">Forgot password?</a>
                  </span>
                </div>
              </>
            )}
            <button type="submit" className="btn btn--primary btn--lg">
              {verified ? 'Verified — choose an organisation' : 'Verify and continue'}
            </button>
            <label className="check text-2">
              <input type="checkbox" defaultChecked /> Keep me signed in on this device for 30 days
            </label>
          </form>
          <div className="login__note">Dealer? Use the mobile number your developer registered. No account? Ask your Sales Manager for an invite.</div>
        </section>

        <section aria-labelledby="s2" className="panel login__card" style={{ flexBasis: 520, maxWidth: 600, opacity: verified ? 1 : 0.9 }}>
          <div className="stack-1">
            <span className="t-label">Step 2 of 2 · Signed in as Usman Tariq</span>
            <h2 id="s2" className="t-h1">
              Choose an organisation
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              You work with 3 developers. You can switch any time from the top bar.
            </p>
          </div>
          <label className="search" style={{ height: 40 }}>
            <Icon name="search" />
            <input aria-label="Filter organisations" placeholder="Filter organisations" value={filter} onChange={(e) => setFilter(e.target.value)} />
          </label>
          <ul className="login__orgs">
            {orgs.map((o, i) => {
              const m = ORG_META[o.id];
              return (
                <li key={o.id}>
                  <button type="button" className={`login__org ${i === 0 ? 'is-recent' : ''}`} onClick={() => choose(o.id)}>
                    <span className="login__org-mark">{o.mark}</span>
                    <span className="col min0 spacer" style={{ gap: 2 }}>
                      <span className="strong ellipsis" style={{ fontSize: 16 }}>
                        {o.name}
                      </span>
                      <span className="small muted">{m.projects}</span>
                    </span>
                    <span className="col" style={{ alignItems: 'flex-end', gap: 4, flex: 'none' }}>
                      <span className="login__role">{m.role}</span>
                      <span className={`small strong ${m.tone === 'bad' ? 'danger-text' : m.tone === 'warn' ? 'warning-text' : 'muted'}`}>{m.due}</span>
                    </span>
                    <Icon name="chevronRight" color="var(--text-muted)" />
                  </button>
                </li>
              );
            })}
            {orgs.length === 0 && <li className="list-row muted">No organisation matches “{filter}”.</li>}
          </ul>
          <label className="check text-2">
            <input type="checkbox" /> Always open Saffron Developers
          </label>
        </section>
      </div>
    </div>
  );
}
