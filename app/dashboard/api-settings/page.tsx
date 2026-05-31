'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Crown,
  Info,
} from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ApiSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [preferredProvider, setPreferredProvider] = useState<'gemini' | 'claude'>('gemini');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    await fetchSettings();
    setIsLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      // Check if Pro user
      const { data: profile } = await supabase
        .from('users')
        .select('plan_type')
        .eq('id', session.user.id)
        .single();

      // @ts-ignore - Type generation issue
      if (!profile || profile.plan_type !== 'pro') {
        setIsPro(false);
        return;
      }

      setIsPro(true);

      // Fetch API key status
      const response = await fetch('/api/user/api-keys', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasExistingKey(data.data.hasClaudeKey);
        setPreferredProvider(data.data.preferredProvider);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/api-keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          claudeApiKey: apiKey || undefined,
          preferredProvider,
        }),
      });

      if (response.ok) {
        toast.success('API settings saved successfully!');
        setApiKey('');
        setShowApiKey(false);
        await fetchSettings();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Failed to save settings');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!confirm('Are you sure you want to remove your Claude API key?')) {
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/user/api-keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          claudeApiKey: '',
          preferredProvider: 'gemini',
        }),
      });

      if (response.ok) {
        toast.success('Claude API key removed');
        setHasExistingKey(false);
        setPreferredProvider('gemini');
        setApiKey('');
      } else {
        toast.error('Failed to remove API key');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Pro Feature</h1>
          <p className="text-muted-foreground mb-6">
            API Settings are only available for Pro users. Upgrade to access Claude 3.5 Sonnet and manage your API keys.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="gap-2">
              <Crown className="w-5 h-5" />
              Upgrade to Pro
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
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
                <Key className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">API Settings</h1>
                <Badge variant="default" className="gap-1">
                  <Crown className="w-3 h-3" />
                  Pro
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Pro users can optionally use Claude 3.5 Sonnet by providing their own API key. Gemini 2.0 Flash (Private) is always available without additional setup.
            </AlertDescription>
          </Alert>

          {/* AI Provider Selection */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>AI Provider</CardTitle>
              <CardDescription>
                Choose which AI model to use for humanization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Preferred Provider</Label>
                <Select
                  value={preferredProvider}
                  onValueChange={(value) => setPreferredProvider(value as 'gemini' | 'claude')}
                  disabled={isSaving || (preferredProvider === 'claude' && !hasExistingKey && !apiKey)}
                >
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">
                      <div className="flex items-center gap-2">
                        <span>🔒 Gemini 2.0 Flash (Private)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="claude" disabled={!hasExistingKey && !apiKey}>
                      <div className="flex items-center gap-2">
                        <span>✨ Claude 3.5 Sonnet</span>
                        {!hasExistingKey && !apiKey && <span className="text-xs">(Add API key first)</span>}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {preferredProvider === 'gemini'
                    ? 'Using our private Gemini instance (zero training on your data)'
                    : 'Using your Claude API (you pay Anthropic directly for usage)'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Claude API Key */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Claude API Key
              </CardTitle>
              <CardDescription>
                Add your Anthropic API key to enable Claude 3.5 Sonnet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {hasExistingKey && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Claude API key is configured</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveKey}
                      disabled={isSaving}
                    >
                      Remove
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  {hasExistingKey ? 'Update API Key' : 'Add API Key'}
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-ant-api03-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isSaving}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">How it works:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Your API key is encrypted and stored securely</li>
                  <li>• We never see or store your actual key in plain text</li>
                  <li>• You pay Anthropic directly for Claude usage</li>
                  <li>• Estimated cost: ~₹0.50-1 per humanization</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSave}
                disabled={isSaving || (preferredProvider === 'claude' && !hasExistingKey && !apiKey)}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
