'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Check, AlertCircle } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: '' };
    if (pwd.length < 6) return { strength: 1, label: 'Weak', color: 'bg-destructive' };
    if (pwd.length < 10) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    }
    return { strength: 2, label: 'Good', color: 'bg-blue-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Check if user has valid password reset session
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      // Check if session exists (user clicked email link)
      setIsValidSession(!!session);
    };

    checkSession();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-md border-border/50 shadow-xl backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid or expired link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Password reset links expire after 1 hour for security reasons.
              </AlertDescription>
            </Alert>
            <Button
              asChild
              className="w-full"
            >
              <Link href="/forgot-password">Request a new reset link</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link href="/login">Return to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-md border-border/50 shadow-xl backdrop-blur-sm animate-scale-in relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Password reset successful!</CardTitle>
            <CardDescription>
              Your password has been updated successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-muted">
              <AlertDescription>
                Redirecting you to the dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <Card className="border-border/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-scale-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="transition-all focus:scale-[1.01]"
                  autoComplete="new-password"
                  autoFocus
                />
                {password && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrength.strength
                              ? passwordStrength.color
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength.label} password
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="transition-all focus:scale-[1.01]"
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Reset password
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
