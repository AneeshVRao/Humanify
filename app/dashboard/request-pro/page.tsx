'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface ExistingRequest {
  id: string;
  message: string;
  use_case?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function RequestProPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<ExistingRequest | null>(null);
  const [message, setMessage] = useState('');
  const [useCase, setUseCase] = useState('');

  useEffect(() => {
    checkExistingRequest();
  }, []);

  const checkExistingRequest = async () => {
    try {
      const response = await fetch('/api/pro-request');
      if (response.ok) {
        const data = await response.json();
        if (data.data.hasRequest) {
          setExistingRequest(data.data.request);
        }
      }
    } catch (error) {
      console.error('Error checking request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.length < 10) {
      toast.error('Please provide more details (at least 10 characters)');
      return;
    }

    if (message.length > 500) {
      toast.error('Message is too long (max 500 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pro-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          useCase: useCase || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Request submitted successfully!');
        // Refresh to show pending state
        await checkExistingRequest();
      } else {
        toast.error(data.error?.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending request status
  if (existingRequest?.status === 'pending') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Request Pending</CardTitle>
                <CardDescription>We've received your Pro access request</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Your message:</p>
              <p className="text-sm bg-white p-3 rounded-md border">{existingRequest.message}</p>
            </div>
            {existingRequest.use_case && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Use case:</p>
                <p className="text-sm bg-white p-3 rounded-md border">{existingRequest.use_case}</p>
              </div>
            )}
            <div className="bg-blue-100 p-4 rounded-md">
              <p className="text-sm text-blue-900 font-medium">
                We'll review your request and contact you soon!
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Submitted on {new Date(existingRequest.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/pricing')}>
              Back to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show approved status
  if (existingRequest?.status === 'approved') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Request Approved!</CardTitle>
                <CardDescription>Your Pro access has been activated</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-100 p-4 rounded-md">
              <p className="text-sm text-green-900 font-medium">
                You now have Pro access! Start humanizing unlimited text with private AI.
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show rejected status
  if (existingRequest?.status === 'rejected') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle>Request Not Approved</CardTitle>
            <CardDescription>Unfortunately, we couldn't approve your Pro request at this time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-100 p-4 rounded-md">
              <p className="text-sm text-red-900">
                You can submit a new request or contact us for more information.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { setExistingRequest(null); setMessage(''); setUseCase(''); }}>
                Submit New Request
              </Button>
              <Button variant="outline" onClick={() => router.push('/pricing')}>
                Back to Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show request form
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Request Pro Access</CardTitle>
              <CardDescription>
                Tell us why you need Pro and we'll review your request
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-semibold text-sm mb-2">Pro Plan Benefits:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unlimited humanizations per day</li>
                <li>• Private Gemini 2.0 Flash (zero training)</li>
                <li>• Support for Claude 3.5 (bring your own API key)</li>
                <li>• Up to 10,000 characters per request</li>
                <li>• Unlimited history storage</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Why do you need Pro access? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us about your use case, why you need unlimited access, etc..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={500}
                required
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/500 characters (minimum 10 required)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase">
                Specific Use Case <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="useCase"
                placeholder="e.g., Academic writing, Content creation, Business communication..."
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting || message.length < 10}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/pricing')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <p className="text-xs text-muted-foreground">
                We'll review your request and contact you within 24-48 hours.
                Once approved, you'll get immediate Pro access.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
