'use client';

import { useState } from 'react';
import { Plus, Search, MoreHorizontal, ArrowUpDown, Eye, Trash2, Pencil, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogBody,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/Toast';
import { useOpsBlogPosts, useSaveBlogPost, useDeleteBlogPost, usePublishBlogPost } from '@/hooks/ops/use-ops-queries';
import type { BlogPost, PostStatus } from '@/types/ops';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-50 text-green-700 border-green-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-orange-50 text-orange-700 border-orange-200',
};

const STATUS_OPTIONS: PostStatus[] = ['draft', 'published', 'scheduled', 'archived'];

export default function BlogPage() {
  const { success, error: showError } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formStatus, setFormStatus] = useState<PostStatus>('draft');
  const [showPreview, setShowPreview] = useState(false);

  const { data: posts = [], isLoading } = useOpsBlogPosts(statusFilter, search || undefined);
  const saveBlogPost = useSaveBlogPost();
  const deleteBlogPost = useDeleteBlogPost();
  const publishBlogPost = usePublishBlogPost();

  const published = posts.filter(p => p.status === 'published');
  const totalViews = posts.reduce((s, p) => s + (p.viewCount || 0), 0);

  function openNew() {
    setFormTitle('');
    setFormExcerpt('');
    setFormContent('');
    setFormAuthor('');
    setFormStatus('draft');
    setShowPreview(false);
    setShowNewDialog(true);
  }

  function openEdit(post: BlogPost) {
    setFormTitle(post.title);
    setFormExcerpt(post.excerpt || '');
    setFormContent(post.content || '');
    setFormAuthor(post.authorName);
    setFormStatus(post.status);
    setShowPreview(false);
    setEditPost(post);
  }

  async function handleCreate() {
    if (!formTitle.trim()) { showError('Error', 'Title is required'); return; }
    try {
      await saveBlogPost.mutateAsync({
        title: formTitle.trim(),
        excerpt: formExcerpt.trim() || null,
        content: formContent.trim() || null,
        authorName: formAuthor.trim() || 'Staff',
        status: formStatus,
        slug: formTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      });
      setShowNewDialog(false);
      success('Post created', `"${formTitle.trim()}" saved as ${formStatus}`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to create post');
    }
  }

  async function handleUpdate() {
    if (!editPost || !formTitle.trim()) return;
    try {
      await saveBlogPost.mutateAsync({
        id: editPost.id,
        title: formTitle.trim(),
        excerpt: formExcerpt.trim() || null,
        content: formContent.trim() || null,
        authorName: formAuthor.trim() || editPost.authorName,
        status: formStatus,
      });
      setEditPost(null);
      success('Post updated', `"${formTitle.trim()}" saved`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to update post');
    }
  }

  async function handleDelete(post: BlogPost) {
    try {
      await deleteBlogPost.mutateAsync(post.id);
      success('Post deleted', `"${post.title}" removed`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to delete post');
    }
  }

  async function handleTogglePublish(post: BlogPost) {
    const isPublished = post.status === 'published';
    try {
      await publishBlogPost.mutateAsync({ postId: post.id, publish: !isPublished });
      success(isPublished ? 'Unpublished' : 'Published', `"${post.title}" ${isPublished ? 'moved to draft' : 'is now live'}`);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Failed to update post');
    }
  }

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Blog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Content management for SEO</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {statusFilter === 'all' ? 'Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
            {STATUS_OPTIONS.map(s => (
              <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">No blog posts yet</p>
            <Button size="sm" className="mt-3 gap-2" onClick={openNew}>
              <Plus className="h-4 w-4" />
              Create your first post
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">Views <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} className="cursor-pointer" onClick={() => openEdit(post)}>
                    <TableCell className="font-medium max-w-[300px]">
                      <span className="truncate block">{post.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[post.status] || STATUS_STYLES.draft}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{post.authorName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(post.publishedAt)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(post.viewCount || 0) > 0 ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          {(post.viewCount || 0).toLocaleString()}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(post); }}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTogglePublish(post); }}>
                            <Eye className="h-4 w-4 mr-2" /> {post.status === 'published' ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(post); }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>{published.length} published &middot; {totalViews.toLocaleString()} total views</span>
            </div>
          </>
        )}
      </Card>

      {/* New Post Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Blog Post</DialogTitle>
            <DialogDescription>Create a new post for your roofing blog</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Post title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input id="excerpt" value={formExcerpt} onChange={e => setFormExcerpt(e.target.value)} placeholder="Brief description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={formAuthor} onChange={e => setFormAuthor(e.target.value)} placeholder="Author name" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formStatus} onChange={e => setFormStatus(e.target.value as PostStatus)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saveBlogPost.isPending}>
              {saveBlogPost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Content Editor */}
      <Dialog open={!!editPost} onOpenChange={(open) => !open && setEditPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Post
            </DialogTitle>
            <DialogDescription>
              {editPost?.slug ? `/${editPost.slug}` : 'Update post details and content'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input id="edit-title" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="text-lg font-semibold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">Excerpt</Label>
              <Input id="edit-excerpt" value={formExcerpt} onChange={e => setFormExcerpt(e.target.value)} placeholder="Brief summary for SEO and previews..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-author">Author</Label>
                <Input id="edit-author" value={formAuthor} onChange={e => setFormAuthor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={formStatus} onChange={e => setFormStatus(e.target.value as PostStatus)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={editPost?.category || ''} disabled className="text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
              </div>
              {showPreview ? (
                <div className="min-h-[400px] rounded-md border bg-muted/30 p-4 prose prose-sm max-w-none">
                  {formContent ? (
                    <div className="whitespace-pre-wrap">{formContent}</div>
                  ) : (
                    <p className="text-muted-foreground italic">No content yet</p>
                  )}
                </div>
              ) : (
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[400px] font-mono resize-y"
                />
              )}
            </div>
            {editPost && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                <span>Created: {formatDate(editPost.createdAt)}</span>
                {editPost.publishedAt && <span>Published: {formatDate(editPost.publishedAt)}</span>}
                {editPost.viewCount ? <span>{editPost.viewCount.toLocaleString()} views</span> : null}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPost(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saveBlogPost.isPending}>
              {saveBlogPost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
