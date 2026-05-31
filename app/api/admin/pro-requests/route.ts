/**
 * PATCH /api/admin/pro-requests
 *
 * Admin endpoint to approve or reject Pro access requests
 */

import { z } from 'zod';
import {
  apiSuccess,
  withErrorHandler,
  ApiError,
  ApiErrorCode,
  validateJsonRequest,
} from '@/lib/api/utils';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/client';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';
import {
  sendProRequestApprovedEmail,
  sendProRequestRejectedEmail,
} from '@/lib/email/send';

const actionSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional(),
});

async function PATCH_Handler(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let supabase;
  let user;
  let authError;

  if (token) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    const result = await supabase.auth.getUser();
    user = result.data.user;
    authError = result.error;
  } else {
    supabase = await createServerSupabaseClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
    authError = result.error;
  }

  if (authError || !user) {
    throw new ApiError(
      ApiErrorCode.UNAUTHORIZED,
      'You must be logged in',
      401
    );
  }

  // SECURITY: Verify admin access
  // This will throw an error if user is not admin
  await requireAdmin(user);

  // Validate request body
  const body = await validateJsonRequest(request);
  const { requestId, action, adminNotes } = actionSchema.parse(body);

  const adminSupabase = createAdminSupabaseClient();

  // Get the request
  const { data: proRequest, error: fetchError } = await adminSupabase
    .from('pro_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !proRequest) {
    throw new ApiError(ApiErrorCode.NOT_FOUND, 'Request not found', 404);
  }

  // Type assertion after null check
  type ProRequest = {
    id: string;
    user_id: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
  };

  const requestData = proRequest as ProRequest;

  // Check if already processed
  if (requestData.status !== 'pending') {
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'This request has already been processed',
      400
    );
  }

  // Update request status
  const updateData = {
    status: action === 'approve' ? 'approved' as const : 'rejected' as const,
    admin_notes: adminNotes || null,
    approved_at: new Date().toISOString(),
    approved_by: user.email || user.id,
  };

  const { error: updateError } = await adminSupabase
    .from('pro_requests')
    // @ts-ignore - Type generation issue with Supabase
    .update(updateData)
    .eq('id', requestId);

  if (updateError) {
    console.error('Error updating request:', updateError);
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      'Failed to update request',
      500
    );
  }

  // If approved, upgrade user to Pro
  if (action === 'approve') {
    const { error: upgradeError } = await adminSupabase
      .from('users')
      // @ts-ignore - Type generation issue
      .update({
        plan_type: 'pro',
        subscription_status: 'active',
      })
      .eq('id', requestData.user_id);

    if (upgradeError) {
      console.error('Error upgrading user:', upgradeError);
      throw new ApiError(
        ApiErrorCode.INTERNAL_ERROR,
        'Failed to upgrade user to Pro',
        500
      );
    }

    // Send approval email
    await sendProRequestApprovedEmail(requestData.email);
  } else {
    // Send rejection email
    await sendProRequestRejectedEmail(
      requestData.email,
      undefined,
      adminNotes
    );
  }

  // Log admin action for audit trail
  await logAdminAction(
    `pro_request_${action}`,
    user.id,
    {
      request_id: requestId,
      target_user_id: requestData.user_id,
      target_email: requestData.email,
      action,
      admin_notes: adminNotes,
    }
  );

  return apiSuccess({
    success: true,
    message: action === 'approve'
      ? 'Request approved and user upgraded to Pro'
      : 'Request rejected',
    requestId,
    action,
  });
}

export const PATCH = withErrorHandler(PATCH_Handler);
