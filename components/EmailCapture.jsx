'use client';

import { useState } from 'react';

export default function EmailCapture({ config }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');

  function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('invalid');
      return;
    }
    // No list provider is wired up. Point this at your ESP (Klaviyo, Resend,
    // Mailchimp) through a route handler before launch — see README.
    setState('done');
  }

  return (
    <div className="capture">
      <div>
        <h2 className="display">{config.headline}</h2>
        <p className="lede">
          {config.subhead} {config.incentive} with code{' '}
          <span className="mono" style={{ color: 'var(--accent)' }}>{config.code_issued}</span>.
        </p>
      </div>

      <div>
        <div className="capture-form">
          <input
            className="search-input"
            type="email"
            inputMode="email"
            placeholder="you@email.com"
            aria-label="Email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setState('idle'); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button type="button" className="btn btn-primary" onClick={submit}>
            {config.button_label}
          </button>
        </div>
        <div aria-live="polite" style={{ marginTop: 8 }}>
          {state === 'invalid' && <span className="note-bad">That email address isn&apos;t valid.</span>}
          {state === 'done' && <span className="note-ok">Check your inbox for {config.code_issued}.</span>}
        </div>
      </div>
    </div>
  );
}
