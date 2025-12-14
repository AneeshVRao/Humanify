'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Clock, Mail, User, Calendar } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

interface ProRequest {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  message: string;
  use_case: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export default function AdminProRequestsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<ProRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ProRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('pro_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load requests';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    setIsProcessing(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/admin/pro-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action: actionType,
          adminNotes: adminNotes || undefined,
        }),
      });

      if (response.ok) {
        toast.success(
          actionType === 'approve'
            ? 'Request approved! User upgraded to Pro.'
            : 'Request rejected.'
        );
        setIsDialogOpen(false);
        setSelectedRequest(null);
        setAdminNotes('');
        await fetchRequests();
      } else {
        const error = await response.json();
        toast.error(error.error?.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Failed to process request');
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionDialog = (request: ProRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes(request.admin_notes || '');
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: ProRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const RequestCard = ({ request }: { request: ProRequest }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4" />
              {request.name || 'Unknown User'}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {request.email}
            </CardDescription>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Message:</Label>
          <p className="text-sm mt-1 bg-muted p-3 rounded-md">{request.message}</p>
        </div>

        {request.use_case && (
          <div>
            <Label className="text-xs text-muted-foreground">Use Case:</Label>
            <p className="text-sm mt-1 bg-muted p-3 rounded-md">{request.use_case}</p>
          </div>
        )}

        {request.admin_notes && (
          <div>
            <Label className="text-xs text-muted-foreground">Admin Notes:</Label>
            <p className="text-sm mt-1 bg-blue-50 p-3 rounded-md border border-blue-200">
              {request.admin_notes}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Submitted {new Date(request.created_at).toLocaleString()}</span>
        </div>

        {request.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => openActionDialog(request, 'approve')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => openActionDialog(request, 'reject')}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {request.approved_at && (
          <div className="text-xs text-muted-foreground">
            {request.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
            {new Date(request.approved_at).toLocaleString()}
            {request.approved_by && ` by ${request.approved_by}`}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const filterRequests = (status: ProRequest['status']) => {
    return requests.filter((r) => r.status === status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pro Access Requests</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage Pro plan access requests
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({filterRequests('pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({filterRequests('approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({filterRequests('rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filterRequests('pending').length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending requests
              </CardContent>
            </Card>
          ) : (
            filterRequests('pending').map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filterRequests('approved').length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No approved requests
              </CardContent>
            </Card>
          ) : (
            filterRequests('approved').map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filterRequests('rejected').length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No rejected requests
              </CardContent>
            </Card>
          ) : (
            filterRequests('rejected').map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Pro Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.name || selectedRequest?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium mb-1">Request Message:</p>
              <p className="text-sm text-muted-foreground">{selectedRequest?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add notes about this decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            {actionType === 'approve' && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <p className="text-sm text-green-900">
                  This will upgrade the user to Pro plan immediately with unlimited access.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isProcessing}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Request
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Request
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
