
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Copy, BarChart3 } from 'lucide-react';
import { formatDate, formatNumber, getDomainFromUrl } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import type { UrlDocument } from '@/types';

interface UrlListProps {
  refresh?: number;
}

export default function UrlList({ refresh }: UrlListProps) {
  const [urls, setUrls] = useState<UrlDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/urls?limit=20');
      const result = await response.json();
      
      if (result.success && result.data) {
        setUrls(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load URLs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [refresh]);

  const copyToClipboard = async (shortCode: string) => {
    try {
      await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`);
      toast({
        title: 'Copied!',
        description: 'Short URL copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading URLs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Recent URLs
        </CardTitle>
        <CardDescription>
          Your recently shortened URLs and their analytics
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {urls.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No URLs shortened yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              Create your first short URL above to get started.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Short Code</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urls.map((url) => (
                  <TableRow key={url._id}>
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-medium truncate">
                          {getDomainFromUrl(url.originalUrl)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {url.originalUrl}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {url.shortCode}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {formatNumber(url.clicks)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(url.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(url.shortCode)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`/${url.shortCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}