'use client';

import { formatDistanceToNow } from 'date-fns';
import { type LucideIcon } from 'lucide-react';
import styles from './analytics.module.css';

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  text: React.ReactNode;
  timestamp: string;
}

interface ActivityFeedProps {
  title?: string;
  items: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
}

function formatTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export function ActivityFeed({
  title = 'Recent Activity',
  items,
  loading = false,
  maxItems = 10,
}: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  if (loading) {
    return (
      <div className={styles.activityFeed}>
        <div className={styles.feedHeader}>
          <h3 className={styles.feedTitle}>{title}</h3>
        </div>
        <div className={styles.feedList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.feedItem}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle} style={{ width: '80%' }} />
                <div className={styles.skeletonTitle} style={{ width: '40%', marginTop: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.activityFeed}>
      <div className={styles.feedHeader}>
        <h3 className={styles.feedTitle}>{title}</h3>
      </div>
      <div className={styles.feedList}>
        {displayItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>
            No recent activity
          </p>
        ) : (
          displayItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className={styles.feedItem}>
                <div
                  className={styles.feedIcon}
                  style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                >
                  <Icon size={16} />
                </div>
                <div className={styles.feedContent}>
                  <p className={styles.feedText}>{item.text}</p>
                  <span className={styles.feedTime}>{formatTime(item.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
