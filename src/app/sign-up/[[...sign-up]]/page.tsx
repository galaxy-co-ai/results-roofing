import { SignUp } from '@clerk/nextjs';
import styles from './page.module.css';

export default function SignUpPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Your Account</h1>
          <p className={styles.subtitle}>
            Sign up to track your roofing project
          </p>
        </div>
        <SignUp
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
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/portal/dashboard"
        />
      </div>
    </main>
  );
}
