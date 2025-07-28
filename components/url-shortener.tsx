'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from './ui/use-toast';
import { Copy, ExternalLink, Scissors } from 'lucide-react';
import { isValidUrl } from '@/lib/utils';
import type { ShortenResponse } from '@/types';

interface UrlShortenerProps {
  onUrlShortened?: () => void;
}

export default function UrlShortener({ onUrlShortened }: UrlShortenerProps) {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      if (result.success && result.data) {
        setShortUrl(result.data.shortUrl);
        toast({
          title: 'Success!',
          description: 'Your URL has been shortened successfully.',
        });
        onUrlShortened?.();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
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

  const visitUrl = () => {
    window.open(shortUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-3xl">
          <Scissors className="h-8 w-8 text-blue-600" />
          URL Shortener
        </CardTitle>
        <CardDescription>
          Transform long URLs into short, shareable links
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Enter your URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/very-long-url..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="text-sm"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Shortening...
              </>
            ) : (
              <>
                <Scissors className="h-4 w-4 mr-2" />
                Shorten URL
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {shortUrl && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-green-800">
                  Your shortened URL:
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shortUrl}
                    readOnly
                    className="font-mono text-sm bg-white border-green-300"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={visitUrl}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}