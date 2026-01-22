import { SignIn } from '@clerk/nextjs';
import styles from './page.module.css';

export default function SignInPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>
            Sign in to access your project portal
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: styles.clerkRoot,
              card: styles.clerkCard,
              headerTitle: styles.clerkHeaderTitle,
              headerSubtitle: styles.clerkHeaderSubtitle,
              formButtonPrimary: styles.clerkButton,
              formFieldInput: styles.clerkInput,
              footerActionLink: styles.clerkLink,
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/portal/dashboard"
        />
      </div>
    </main>
  );
}
