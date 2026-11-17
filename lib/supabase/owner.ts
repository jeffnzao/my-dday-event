import { createSupabaseServerClient } from "./server";
import { createSupabaseServiceClient } from "./service";

export async function getOwnerSession() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, adminClient: null, owner: false, authenticated: false, error: null as string | null };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("Owner session verification failed:", userError.message);
    return { supabase, adminClient: null, owner: false, authenticated: false, error: "La session ne peut pas être vérifiée." };
  }
  if (!user) return { supabase, adminClient: null, owner: false, authenticated: false, error: null as string | null };
  const { data, error } = await supabase
    .from("owner_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("Owner permission lookup failed:", error.message);
    return { supabase, adminClient: null, owner: false, authenticated: true, error: "Les permissions propriétaire ne peuvent pas être vérifiées." };
  }
  const ownerIsAuthorized = Boolean(data);
  return {
    supabase,
    adminClient: ownerIsAuthorized ? createSupabaseServiceClient() : null,
    owner: ownerIsAuthorized,
    authenticated: true,
    error: null as string | null,
  };
}
