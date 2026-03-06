-- ============================================================================
-- Security Fixes Migration
-- ============================================================================

-- 1. Fix "Function Search Path Mutable" Warning
-- Add SET search_path = '' to functions to prevent search path hijacking.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- 2. Fix "RLS Policy Always True" Warning for tenant_profiles
-- The previous policies allowed anyone with the service_role key to insert/update,
-- but `USING (true)` and `WITH CHECK (true)` triggers security warnings.
-- We will change it so only authenticated users or specific logic applies,
-- or at least restrict it safely so it's not a blanket `true` string.

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "tenant_profiles_service_insert" ON public.tenant_profiles;
DROP POLICY IF EXISTS "tenant_profiles_service_update" ON public.tenant_profiles;

-- Instead of (true), we restrict to authenticated users or service role by checking auth.role()
-- Since service_role bypasses RLS anyway, we don't strictly need a policy explicitly for service_role inserts
-- but if we want to allow user inserts, we restrict it to their own auth_id:

CREATE POLICY "tenant_profiles_self_insert" ON public.tenant_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth_id = auth.uid());

CREATE POLICY "tenant_profiles_self_update" ON public.tenant_profiles
    FOR UPDATE 
    TO authenticated
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- Note: The service_role key automatically bypasses RLS, so API routes using service_role 
-- will still be able to insert/update without needing `USING (true)` policies.


-- 3. The "Leaked Password Protection Disabled" warning in the screenshot
-- This is a Supabase Auth setting, not a database schema issue.
-- It must be enabled via the Supabase Dashboard:
-- Authentication -> Advanced -> Enable "Leaked password protection"
