'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

/**
 * Check if Clerk is bypassed (for development)
 */
const BYPASS_CLERK = process.env.NEXT_PUBLIC_BYPASS_CLERK === 'true';

/**
 * Custom Sign In Page - Branded for Results Roofing
 * Uses Clerk's SignIn component with custom appearance
 */
export default function SignInPage() {
  const router = useRouter();

  // In bypass mode, show a simple dev redirect
  if (BYPASS_CLERK) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.logo} aria-label="Results Roofing - Home">
            <div className={styles.appIcon} aria-hidden="true">
              <Home size={22} strokeWidth={2.5} />
            </div>
            <span className={styles.brandText}>
              <span className={styles.brandName}>Results</span>{' '}
              <span className={styles.brandSuffix}>Roofing</span>
            </span>
          </Link>
        </header>

        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.heading}>
              <h1 className={styles.title}>Welcome <span className={styles.titleAccent}>back</span></h1>
              <p className={styles.subtitle}>
                Sign in to view your quote and manage your project
              </p>
            </div>

            <div className={styles.devCard}>
              <p className={styles.devNote}>
                Authentication is bypassed in development mode.
              </p>
              <button
                onClick={() => router.push('/portal/dashboard')}
                className={styles.devButton}
              >
                Continue to Dashboard
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Results Roofing. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="Results Roofing - Home">
          <div className={styles.appIcon} aria-hidden="true">
            <Home size={22} strokeWidth={2.5} />
          </div>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Results</span>{' '}
            <span className={styles.brandSuffix}>Roofing</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Welcome <span className={styles.titleAccent}>back</span></h1>
            <p className={styles.subtitle}>
              Sign in to view your quote and manage your project
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: styles.clerkRootBox,
                card: styles.clerkCard,
                headerTitle: styles.clerkHeaderTitle,
                headerSubtitle: styles.clerkHeaderSubtitle,
                socialButtonsBlockButton: styles.clerkSocialButton,
                socialButtonsBlockButtonText: styles.clerkSocialButtonText,
                dividerLine: styles.clerkDivider,
                dividerText: styles.clerkDividerText,
                formFieldLabel: styles.clerkLabel,
                formFieldInput: styles.clerkInput,
                formButtonPrimary: styles.clerkPrimaryButton,
                footerActionLink: styles.clerkLink,
                identityPreviewEditButton: styles.clerkEditButton,
                formFieldInputShowPasswordButton: styles.clerkShowPassword,
              },
              variables: {
                colorPrimary: '#3b82f6',
                colorBackground: '#ffffff',
                colorText: '#1E2329',
                colorTextSecondary: '#6B7A94',
                colorInputBackground: '#ffffff',
                colorInputText: '#1E2329',
                borderRadius: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
            }}
            signUpUrl="/sign-up"
            forceRedirectUrl="/portal/dashboard"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Results Roofing. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
