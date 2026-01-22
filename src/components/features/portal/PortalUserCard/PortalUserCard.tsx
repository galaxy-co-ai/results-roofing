'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import { User, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import styles from './PortalUserCard.module.css';

/**
 * Portal user card showing authenticated user info from Clerk
 * Displays user name, email, and sign out button
 */
export function PortalUserCard() {
  const { user, isLoaded } = useUser();

  // Loading state
  if (!isLoaded) {
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

      <SignOutButton>
        <button 
          className={styles.signOutButton}
          aria-label="Sign out of your account"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </SignOutButton>
    </div>
  );
}

export default PortalUserCard;
