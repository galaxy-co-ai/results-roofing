'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostList, PostEditor } from '@/components/features/ops/blog';
import type { BlogPost, PostStatus } from '@/components/features/ops/blog';

type ViewMode = 'list' | 'editor';

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/ops/blog/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');

      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreate = () => {
    setSelectedPost(null);
    setViewMode('editor');
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setViewMode('editor');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedPost(null);
  };

  const handleSave = async (data: Partial<BlogPost>) => {
    try {
      setSaving(true);

      if (selectedPost?.id) {
        // Update existing post
        const response = await fetch(`/api/ops/blog/posts/${selectedPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to save post');

        const result = await response.json();
        setSelectedPost(result.post);

        // Update in list
        setPosts((prev) =>
          prev.map((p) => (p.id === result.post.id ? result.post : p))
        );
      } else {
        // Create new post
        const response = await fetch('/api/ops/blog/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to create post');

        const result = await response.json();
        setSelectedPost(result.post);
        setPosts((prev) => [result.post, ...prev]);
      }
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedPost) return;

    try {
      setPublishing(true);

      const response = await fetch(`/api/ops/blog/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });

      if (!response.ok) throw new Error('Failed to publish post');

      const result = await response.json();
      setSelectedPost(result.post);

      // Update in list
      setPosts((prev) =>
        prev.map((p) => (p.id === result.post.id ? result.post : p))
      );
    } catch (error) {
      console.error('Failed to publish post:', error);
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishFromList = async (postId: string) => {
    try {
      const response = await fetch(`/api/ops/blog/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });

      if (!response.ok) throw new Error('Failed to publish post');

      const result = await response.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === result.post.id ? result.post : p))
      );
    } catch (error) {
      console.error('Failed to publish post:', error);
    }
  };

  const handleUnpublish = async (postId: string) => {
    try {
      const response = await fetch(`/api/ops/blog/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      });

      if (!response.ok) throw new Error('Failed to unpublish post');

      const result = await response.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === result.post.id ? result.post : p))
      );
    } catch (error) {
      console.error('Failed to unpublish post:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/ops/blog/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handlePreview = () => {
    if (selectedPost?.slug) {
      window.open(`/blog/${selectedPost.slug}`, '_blank');
    }
  };

  // Filter posts for display
  const filteredPosts = posts.filter((post) => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  if (viewMode === 'editor') {
    return (
      <PostEditor
        post={selectedPost}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={handlePreview}
        onBack={handleBack}
        saving={saving}
        publishing={publishing}
      />
    );
  }

  return (
    <PostList
      posts={filteredPosts}
      loading={loading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onPublish={handlePublishFromList}
      onUnpublish={handleUnpublish}
    />
  );
}
