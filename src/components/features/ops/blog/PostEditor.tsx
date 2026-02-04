'use client';

import { useState, useCallback } from 'react';
import {
  Save,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Calendar,
  Tag,
  Globe,
  Settings,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BlogPost } from './PostList';
import styles from './blog.module.css';

interface PostEditorProps {
  post?: BlogPost | null;
  onSave: (data: Partial<BlogPost>) => Promise<void>;
  onPublish: () => Promise<void>;
  onPreview: () => void;
  onBack: () => void;
  saving?: boolean;
  publishing?: boolean;
}

export function PostEditor({
  post,
  onSave,
  onPublish,
  onPreview,
  onBack,
  saving = false,
  publishing = false,
}: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || '');
  const [category, setCategory] = useState(post?.category || '');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Auto-generate slug from title
  const generateSlug = useCallback((titleText: string) => {
    return titleText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!post?.slug) {
      setSlug(generateSlug(value));
    }
    setHasChanges(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setHasChanges(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
    });
    setHasChanges(false);
  };

  const isNew = !post?.id;
  const isDraft = !post || post.status === 'draft';

  return (
    <div className={styles.editor}>
      {/* Header */}
      <header className={styles.editorHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className={styles.headerInfo}>
            <h1>{isNew ? 'New Post' : 'Edit Post'}</h1>
            {post?.status && (
              <span className={`${styles.statusBadge} ${styles[post.status]}`}>
                {post.status}
              </span>
            )}
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye size={14} />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? <Loader2 size={14} className={styles.spinner} /> : <Save size={14} />}
            Save Draft
          </Button>
          {isDraft && (
            <Button
              size="sm"
              onClick={onPublish}
              disabled={publishing || !title.trim()}
            >
              {publishing ? (
                <Loader2 size={14} className={styles.spinner} />
              ) : (
                <Globe size={14} />
              )}
              Publish
            </Button>
          )}
          <button
            className={styles.settingsToggle}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.editorBody}>
        {/* Editor Panel */}
        <main className={styles.editorMain}>
          {/* Title */}
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={styles.titleInput}
          />

          {/* Excerpt */}
          <textarea
            placeholder="Write a brief excerpt (optional)..."
            value={excerpt}
            onChange={(e) => {
              setExcerpt(e.target.value);
              setHasChanges(true);
            }}
            className={styles.excerptInput}
            rows={2}
          />

          {/* Content Editor */}
          <div className={styles.contentEditor}>
            <div className={styles.editorToolbar}>
              <button type="button" title="Bold">
                <strong>B</strong>
              </button>
              <button type="button" title="Italic">
                <em>I</em>
              </button>
              <button type="button" title="Heading">
                H
              </button>
              <button type="button" title="Link">
                🔗
              </button>
              <button type="button" title="Image">
                <ImageIcon size={14} />
              </button>
              <button type="button" title="Quote">
                &quot;
              </button>
              <button type="button" title="List">
                •
              </button>
              <button type="button" title="Code">
                {'</>'}
              </button>
            </div>
            <textarea
              placeholder="Write your post content here...

You can use Markdown formatting:
- **bold** for bold text
- *italic* for italic text
- # Heading for headings
- [link](url) for links
- ![alt](url) for images"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setHasChanges(true);
              }}
              className={styles.contentInput}
            />
          </div>
        </main>

        {/* Settings Panel */}
        {showSettings && (
          <aside className={styles.editorSidebar}>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>
                <Globe size={14} />
                URL Slug
              </h3>
              <div className={styles.slugInput}>
                <span className={styles.slugPrefix}>/blog/</span>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="post-slug"
                />
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>
                <ImageIcon size={14} />
                Featured Image
              </h3>
              {featuredImage ? (
                <div className={styles.imagePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredImage} alt="Featured" />
                  <button
                    className={styles.removeImage}
                    onClick={() => {
                      setFeaturedImage('');
                      setHasChanges(true);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <Input
                  placeholder="Image URL"
                  value={featuredImage}
                  onChange={(e) => {
                    setFeaturedImage(e.target.value);
                    setHasChanges(true);
                  }}
                />
              )}
            </div>

            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>
                <Calendar size={14} />
                Category
              </h3>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setHasChanges(true);
                }}
                className={styles.categorySelect}
              >
                <option value="">Select category</option>
                <option value="roofing-tips">Roofing Tips</option>
                <option value="maintenance">Maintenance</option>
                <option value="materials">Materials</option>
                <option value="news">News</option>
                <option value="case-studies">Case Studies</option>
              </select>
            </div>

            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>
                <Tag size={14} />
                Tags
              </h3>
              <div className={styles.tagInput}>
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={styles.addTagBtn}
                >
                  <Plus size={14} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className={styles.tagList}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {post && (
              <div className={styles.sidebarSection}>
                <h3 className={styles.sectionTitle}>Info</h3>
                <dl className={styles.postInfo}>
                  <div>
                    <dt>Created</dt>
                    <dd>{new Date(post.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{new Date(post.updatedAt).toLocaleDateString()}</dd>
                  </div>
                  {post.publishedAt && (
                    <div>
                      <dt>Published</dt>
                      <dd>{new Date(post.publishedAt).toLocaleDateString()}</dd>
                    </div>
                  )}
                  {post.viewCount !== undefined && (
                    <div>
                      <dt>Views</dt>
                      <dd>{post.viewCount.toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

export default PostEditor;
