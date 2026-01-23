'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import { User, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';
import styles from './PortalUserCard.module.css';

interface UserData {
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
}

/**
 * Renders the user card UI
 */
function UserCardContent({ user, isDevMode }: { user: UserData | null; isDevMode: boolean }) {
  // Get display name
  const displayName = user?.firstName 
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : 'Welcome back';
  
  const email = user?.primaryEmailAddress?.emailAddress || '';

  // Get initials for avatar
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName
      ? user.firstName[0].toUpperCase()
      : null;

  return (
    <div className={styles.container}>
      <div className={styles.userCard}>
        <div className={styles.userAvatar} aria-hidden="true">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={user.imageUrl} 
              alt="" 
              className={styles.avatarImage}
            />
          ) : initials ? (
            <span className={styles.avatarInitials}>{initials}</span>
          ) : (
            <User size={20} />
          )}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.userEmail}>{email}</span>
        </div>
      </div>

      {isDevMode ? (
        <button 
          className={styles.signOutButton}
          aria-label="Sign out (disabled in dev mode)"
          disabled
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Dev Mode</span>
        </button>
      ) : (
        <SignOutButton>
          <button 
            className={styles.signOutButton}
            aria-label="Sign out of your account"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      )}
    </div>
  );
}

/**
 * Loading skeleton for user card
 */
function UserCardSkeleton() {
  return (
    <div className={styles.userCard}>
      <div className={styles.userAvatar}>
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <div className={styles.userInfo}>
        <Skeleton variant="text" width={100} height={16} />
        <Skeleton variant="text" width={140} height={14} />
      </div>
    </div>
  );
}

/**
 * Portal user card with Clerk auth
 */
function ClerkUserCard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <UserCardSkeleton />;
  }

  return <UserCardContent user={user} isDevMode={false} />;
}

/**
 * Portal user card with mock data (dev bypass mode)
 */
function DevUserCard() {
  return <UserCardContent user={MOCK_USER} isDevMode={true} />;
}

/**
 * Portal user card showing authenticated user info from Clerk
 * Displays user name, email, and sign out button
 */
export function PortalUserCard() {
  // Render different component based on bypass mode to avoid conditional hooks
  if (DEV_BYPASS_ENABLED) {
    return <DevUserCard />;
  }
  return <ClerkUserCard />;
}

export default PortalUserCard;
