'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ops.module.css';

export function OpsLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/ops/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      // Refresh the page to load authenticated layout
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginLogo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo/primary/results-roofing-horizontal-dark.svg"
              alt="Results Roofing"
              style={{ height: '32px', width: 'auto' }}
            />
          </div>
          <h1 className={styles.loginTitle}>Operations Dashboard</h1>
          <p className={styles.loginSubtitle}>
            Enter your password to access CRM, messaging, and analytics
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && <div className={styles.loginError}>{error}</div>}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={styles.loginInput}
            autoFocus
            required
          />

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OpsLogin;
