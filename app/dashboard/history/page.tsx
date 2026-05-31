'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

type Tone = 'casual' | 'professional' | 'academic' | 'neutral';

interface Humanization {
  id: string;
  originalText: string;
  humanizedText: string;
  tone: Tone;
  characterCount: number;
  aiScoreBefore?: number;
  aiScoreAfter?: number;
  processingTimeMs?: number;
  aiProvider: string;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Humanization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTone, setFilterTone] = useState<Tone | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchHistory();
    }
  }, [page, filterTone, searchQuery, isLoading]);

  const checkAuth = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filterTone !== 'all' && { tone: filterTone }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/user/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.data.items);
        setHasMore(data.data.pagination.hasNextPage);
      } else {
        console.error('History API error:', response.status, await response.text());
        toast.error('Could not load history', {
          description: 'Please refresh the page or try again later'
        });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Could not load history', {
        description: 'Please check your connection and try again'
      });
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getToneBadgeColor = (tone: Tone) => {
    const colors = {
      casual: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      professional: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      academic: 'bg-green-500/10 text-green-500 border-green-500/20',
      neutral: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return colors[tone];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">History</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find your past humanizations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search in your humanizations..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Tone: {filterTone === 'all' ? 'All' : filterTone}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Tone</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setFilterTone('all'); setPage(1); }}>
                    All Tones
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setFilterTone('casual'); setPage(1); }}>
                    Casual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setFilterTone('professional'); setPage(1); }}>
                    Professional
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setFilterTone('academic'); setPage(1); }}>
                    Academic
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setFilterTone('neutral'); setPage(1); }}>
                    Neutral
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* History Items */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No humanizations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your humanized texts will appear here
                </p>
                <Link href="/dashboard">
                  <Button className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Start Humanizing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {items.map((item) => (
                <Card key={item.id} className="border-border/50 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getToneBadgeColor(item.tone)}>
                            {item.tone}
                          </Badge>
                          <Badge variant="outline">
                            {item.characterCount} chars
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.createdAt)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Powered by {item.aiProvider === 'gemini' ? 'Gemini AI' : item.aiProvider}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Original Text */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-muted-foreground">Original</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.originalText, `orig-${item.id}`)}
                          className="gap-2"
                        >
                          {copiedId === `orig-${item.id}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                        <p className="text-sm line-clamp-3">{item.originalText}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>

                    {/* Humanized Text */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-primary">Humanized</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.humanizedText, `human-${item.id}`)}
                          className="gap-2"
                        >
                          {copiedId === `human-${item.id}` ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm">{item.humanizedText}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {(page > 1 || hasMore) && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasMore}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
