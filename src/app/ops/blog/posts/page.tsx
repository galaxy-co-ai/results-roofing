'use client';

import { useState } from 'react';
import { PostList, PostEditor } from '@/components/features/ops/blog';
import type { BlogPost, PostStatus } from '@/components/features/ops/blog';
import {
  useOpsBlogPosts,
  useSaveBlogPost,
  useDeleteBlogPost,
  usePublishBlogPost,
} from '@/hooks/ops/use-ops-queries';

type ViewMode = 'list' | 'editor';

export default function BlogPostsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const { data: posts = [], isLoading: loading } = useOpsBlogPosts(statusFilter, searchQuery);
  const saveBlogPost = useSaveBlogPost();
  const deleteBlogPost = useDeleteBlogPost();
  const publishBlogPost = usePublishBlogPost();

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
      const result = await saveBlogPost.mutateAsync({ ...data, id: selectedPost?.id });
      setSelectedPost(result.post);
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  const handlePublish = async () => {
    if (!selectedPost) return;
    try {
      const result = await saveBlogPost.mutateAsync({ id: selectedPost.id, status: 'published' });
      setSelectedPost(result.post);
    } catch (error) {
      console.error('Failed to publish post:', error);
    }
  };

  const handlePublishFromList = async (postId: string) => {
    try {
      await publishBlogPost.mutateAsync({ postId, publish: true });
    } catch (error) {
      console.error('Failed to publish post:', error);
    }
  };

  const handleUnpublish = async (postId: string) => {
    try {
      await publishBlogPost.mutateAsync({ postId, publish: false });
    } catch (error) {
      console.error('Failed to unpublish post:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteBlogPost.mutateAsync(postId);
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
        saving={saveBlogPost.isPending}
        publishing={saveBlogPost.isPending}
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
