'use client';

import { Plus, Search, MoreHorizontal, ArrowUpDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const POSTS = [
  { id: '1', title: '10 Signs You Need a Roof Replacement', status: 'published', author: 'Jake Sullivan', published: 'Feb 5, 2026', views: 1240 },
  { id: '2', title: 'Understanding Roof Insurance Claims', status: 'published', author: 'Anna Brooks', published: 'Jan 28, 2026', views: 890 },
  { id: '3', title: 'How to Choose the Right Roofing Material', status: 'draft', author: 'Jake Sullivan', published: '—', views: 0 },
  { id: '4', title: 'Spring Roof Maintenance Checklist', status: 'scheduled', author: 'Tyler Clark', published: 'Feb 15, 2026', views: 0 },
  { id: '5', title: 'Roof Warranty: What You Need to Know', status: 'published', author: 'Anna Brooks', published: 'Jan 15, 2026', views: 672 },
  { id: '6', title: 'Metal vs Asphalt Shingles: Complete Guide', status: 'published', author: 'Jake Sullivan', published: 'Jan 8, 2026', views: 1580 },
  { id: '7', title: 'Emergency Roof Repair: What to Do', status: 'draft', author: 'Tyler Clark', published: '—', views: 0 },
];

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-50 text-green-700 border-green-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function BlogPage() {
  const published = POSTS.filter(p => p.status === 'published');
  const totalViews = POSTS.reduce((s, p) => s + p.views, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Blog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Content management for SEO</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts..." className="pl-9 h-9" />
        </div>
        <Button variant="outline" size="sm">Status</Button>
        <Button variant="outline" size="sm">Author</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right"><div className="flex items-center justify-end gap-1">Views <ArrowUpDown className="h-3 w-3" /></div></TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {POSTS.map((post) => (
              <TableRow key={post.id} className="cursor-pointer">
                <TableCell className="font-medium max-w-[300px]">
                  <span className="truncate block">{post.title}</span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_STYLES[post.status]}`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{post.author}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{post.published}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {post.views > 0 ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      {post.views.toLocaleString()}
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <span>{published.length} published &middot; {totalViews.toLocaleString()} total views</span>
        </div>
      </Card>
    </div>
  );
}
