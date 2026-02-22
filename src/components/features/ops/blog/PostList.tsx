'use client';

import { formatDistanceToNow, format } from 'date-fns';
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Calendar,
  User,
  Tag,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import styles from './blog.module.css';

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

/**
 * BlogPost shape — matches the DB row returned by the API.
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  gradient?: string | null;
  icon?: string | null;
  status: PostStatus;
  authorName: string;
  authorRole?: string | null;
  category?: string | null;
  tags?: string[] | null;
  readTime?: number | null;
  featured?: boolean | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  viewCount?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
}

interface PostListProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
  onPublish: (postId: string) => void;
  onUnpublish: (postId: string) => void;
  onDuplicate?: (postId: string) => void;
  onCreate: () => void;
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: PostStatus | 'all';
  onStatusFilterChange?: (status: PostStatus | 'all') => void;
}

function getStatusBadge(status: PostStatus) {
  switch (status) {
    case 'published':
      return <span className={`${styles.statusBadge} ${styles.published}`}>Published</span>;
    case 'draft':
      return <span className={`${styles.statusBadge} ${styles.draft}`}>Draft</span>;
    case 'scheduled':
      return <span className={`${styles.statusBadge} ${styles.scheduled}`}>Scheduled</span>;
    case 'archived':
      return <span className={`${styles.statusBadge} ${styles.archived}`}>Archived</span>;
    default:
      return null;
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export function PostList({
  posts,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onDuplicate,
  onCreate,
  loading = false,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
}: PostListProps) {
  const statusCounts = {
    all: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    archived: posts.filter((p) => p.status === 'archived').length,
  };

  return (
    <div className={styles.postList}>
      {/* Header */}
      <div className={styles.listHeader}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Button onClick={onCreate} size="sm">
          <Plus size={14} />
          New Post
        </Button>
      </div>

      {/* Status Tabs */}
      <div className={styles.statusTabs}>
        {(['all', 'published', 'draft', 'scheduled'] as const).map((status) => (
          <button
            key={status}
            className={`${styles.statusTab} ${statusFilter === status ? styles.active : ''}`}
            onClick={() => onStatusFilterChange?.(status)}
          >
            <span className={styles.statusLabel}>
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className={styles.statusCount}>{statusCounts[status]}</span>
          </button>
        ))}
      </div>

      {/* Post Grid */}
      <div className={styles.postGrid}>
        {loading ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.postCardSkeleton}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonExcerpt} />
                <div className={styles.skeletonMeta} />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} />
            <h3>No posts found</h3>
            <p>Create your first blog post to get started</p>
            <Button onClick={onCreate}>
              <Plus size={14} />
              Create Post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={styles.postCard}>
              {/* Featured Image */}
              <div
                className={styles.postImage}
                style={{
                  backgroundImage: post.featuredImage
                    ? `url(${post.featuredImage})`
                    : post.gradient
                      ? post.gradient
                      : 'linear-gradient(135deg, var(--ops-accent-documents) 0%, color-mix(in srgb, var(--ops-accent-documents) 80%, black) 100%)',
                }}
              >
                {getStatusBadge(post.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={styles.cardMenu}>
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(post)}>
                      <Edit2 size={14} /> Edit
                    </DropdownMenuItem>
                    {post.status === 'published' ? (
                      <DropdownMenuItem onClick={() => onUnpublish(post.id)}>
                        <EyeOff size={14} /> Unpublish
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onPublish(post.id)}>
                        <Eye size={14} /> Publish
                      </DropdownMenuItem>
                    )}
                    {post.status === 'published' && (
                      <DropdownMenuItem asChild>
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} /> View Post
                        </a>
                      </DropdownMenuItem>
                    )}
                    {onDuplicate && (
                      <DropdownMenuItem onClick={() => onDuplicate(post.id)}>
                        <FileText size={14} /> Duplicate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(post.id)}
                      className="text-[var(--admin-status-error)]"
                    >
                      <Trash2 size={14} /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <div className={styles.postContent} onClick={() => onEdit(post)}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                {post.excerpt && (
                  <p className={styles.postExcerpt}>{post.excerpt}</p>
                )}

                {/* Meta */}
                <div className={styles.postMeta}>
                  <div className={styles.metaItem}>
                    <User size={12} />
                    <span>{post.authorName}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Calendar size={12} />
                    <span>
                      {post.status === 'published' && post.publishedAt
                        ? formatDate(post.publishedAt)
                        : post.status === 'scheduled' && post.scheduledAt
                          ? `Scheduled: ${formatDate(post.scheduledAt)}`
                          : `Updated ${formatRelativeTime(post.updatedAt)}`}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className={styles.postTags}>
                    <Tag size={12} />
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className={styles.tagMore}>+{post.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Stats */}
                {post.status === 'published' && post.viewCount != null && (
                  <div className={styles.postStats}>
                    <Eye size={12} />
                    <span>{post.viewCount.toLocaleString()} views</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PostList;
