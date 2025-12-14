/**
 * Admin Authorization Module
 *
 * Security Engineer: Multi-layer admin verification
 * - Database role check (source of truth)
 * - Email whitelist (fallback)
 * - Audit logging
 *
 * CRITICAL: All admin operations MUST call these functions
 */

import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Email whitelist for emergency admin access
 * Use this as fallback if database check fails
 *
 * SECURITY: Load from environment variable instead of hardcoding
 */
const getAdminEmails = (): string[] => {
  const envEmails = process.env.ADMIN_EMAILS;
  if (!envEmails) {
    console.warn(
      "ADMIN_EMAILS environment variable not set. Admin access limited to database roles only."
    );
    return [];
  }
  return envEmails.split(",").map((email) => email.trim());
};

const ADMIN_EMAILS = getAdminEmails();

/**
 * Check if user is admin (server-side only)
 *
 * Security: This function MUST only be called server-side
 * Uses service role to bypass RLS
 *
 * @param userId - User ID to check
 * @returns Promise<boolean> - true if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Use admin client to bypass RLS
    const supabase = createAdminSupabaseClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("is_admin, email")
      .eq("id", userId)
      .single();

    if (error || !user) {
      // SECURITY: Don't log full error
      console.error("Admin check error:", {
        code: error?.code,
        message: error?.message,
      });
      return false;
    }

    // Type assertion for user data
    const userData = user as { is_admin: boolean | null; email: string | null };

    // Check database role first (source of truth)
    if (userData.is_admin === true) {
      return true;
    }

    // Fallback to email whitelist
    if (userData.email && ADMIN_EMAILS.includes(userData.email)) {
      console.warn(
        `User ${userData.email} accessed admin via whitelist. Update database: is_admin = TRUE`
      );
      return true;
    }

    return false;
  } catch (error: any) {
    // SECURITY: Don't log full error
    console.error("Admin check exception:", {
      name: error?.name,
      message: error?.message,
    });
    return false;
  }
}

/**
 * Check if current session user is admin
 *
 * @returns Promise<{ isAdmin: boolean; user: User | null }>
 */
export async function checkCurrentUserIsAdmin(): Promise<{
  isAdmin: boolean;
  user: User | null;
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { isAdmin: false, user: null };
    }

    const adminStatus = await isAdmin(user.id);

    return { isAdmin: adminStatus, user };
  } catch (error: any) {
    // SECURITY: Don't log full error
    console.error("Current user admin check failed:", {
      name: error?.name,
      message: error?.message,
    });
    return { isAdmin: false, user: null };
  }
}

/**
 * Require admin access (throw if not admin)
 * Use this in API routes that require admin access
 *
 * @throws Error if user is not admin
 * @returns Promise<User> - The authenticated admin user
 */
export async function requireAdmin(): Promise<User> {
  const { isAdmin: userIsAdmin, user } = await checkCurrentUserIsAdmin();

  if (!userIsAdmin || !user) {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

/**
 * Audit log for admin actions
 * Log all admin operations for security audit trail
 *
 * @param action - Action performed
 * @param userId - User who performed action
 * @param metadata - Additional context
 */
export async function logAdminAction(
  action: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient();

    const logRecord = {
      user_id: userId,
      action: `admin:${action}`,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        is_admin_action: true,
      } as any,
    };

    await (supabase.from("usage_logs") as any).insert(logRecord);
  } catch (error: any) {
    // Don't fail the request if logging fails
    // SECURITY: Don't log full error
    console.error("Failed to log admin action:", {
      name: error?.name,
      message: error?.message,
    });
  }
}

/**
 * Check if email is in admin whitelist
 * For debugging/emergency access only
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

/**
 * Get all admin users (for admin panel)
 * Only callable by admins
 */
export async function getAdminUsers(
  requestingUserId: string
): Promise<
  Array<{ id: string; email: string; name: string | null; created_at: string }>
> {
  // Verify requester is admin
  const adminStatus = await isAdmin(requestingUserId);
  if (!adminStatus) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    // SECURITY: Don't log full error
    console.error("Failed to fetch admin users:", {
      code: error.code,
      message: error.message,
    });
    return [];
  }

  return data || [];
}
