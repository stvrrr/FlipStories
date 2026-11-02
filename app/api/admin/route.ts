import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

const adminUserId = "b3cf6d3d-3f8c-43f1-92b6-b07b115accde";
const profileBadgeKeys = new Set([
  "early_member",
  "story_seeker",
  "century_story",
  "community_favorite",
  "premium_member",
  "event_participant",
  "hitmaker",
  "collaborative_spark",
]);

export async function GET() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.id !== adminUserId) return Response.json({ error: "Forbidden" }, { status: 403 });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured" }, { status: 503 });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const [{ data: users, error: usersError }, storyResult, { data: settings, error: settingsError }, { data: badgeRows, error: badgeError }] = await Promise.all([
    admin.from("profiles").select("id,username,display_name,bio,avatar_url,created_at,is_premium,premium_until,last_active_at").order("created_at", { ascending: false }),
    admin.from("stories").select("id,title,status,visibility,author_id,created_at,is_pinned,pin_label,profiles!stories_author_id_fkey(id)").order("created_at", { ascending: false }),
    admin.from("site_settings").select("site_image_url").eq("id", true).maybeSingle(),
    admin.from("profile_badges").select("profile_id,badge_key"),
  ]);
  if (usersError) return Response.json({ error: `Could not load users: ${usersError.message}` }, { status: 500 });
  if (settingsError) return Response.json({ error: `Could not load site settings: ${settingsError.message}` }, { status: 500 });
  if (badgeError) return Response.json({ error: `Could not load profile badges: ${badgeError.message}` }, { status: 500 });
  const authUsersById = new Map<string, { email: string | null; last_sign_in_at: string | null; banned_until: string | null }>();
  for (let page = 1; ; page += 1) {
    const { data: authUsers, error: authUsersError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (authUsersError) return Response.json({ error: `Could not load account details: ${authUsersError.message}` }, { status: 500 });
    for (const authUser of authUsers.users) {
      authUsersById.set(authUser.id, {
        email: authUser.email ?? null,
        last_sign_in_at: authUser.last_sign_in_at ?? null,
        banned_until: authUser.banned_until ?? null,
      });
    }
    if (authUsers.users.length < 1000) break;
  }
  const manualBadgesByProfile = new Map<string, string[]>();
  for (const badge of badgeRows ?? []) {
    manualBadgesByProfile.set(badge.profile_id, [...(manualBadgesByProfile.get(badge.profile_id) ?? []), badge.badge_key]);
  }

  let stories = storyResult.data;
  let pinningAvailable = true;
  if (storyResult.error) {
    const fallback = await admin
      .from("stories")
      .select("id,title,status,visibility,author_id,created_at")
      .order("created_at", { ascending: false });
    if (fallback.error) return Response.json({ error: `Could not load stories: ${fallback.error.message}` }, { status: 500 });
    stories = (fallback.data ?? []).map((story) => ({ ...story, is_pinned: false, pin_label: null, profiles: [] }));
    pinningAvailable = false;
  }

  return Response.json({
    users: (users ?? []).map((profile) => ({
      ...profile,
      ...authUsersById.get(profile.id),
      manual_badges: manualBadgesByProfile.get(profile.id) ?? [],
    })),
    stories: stories ?? [],
    pinningAvailable,
    settings: settings ?? { site_image_url: null },
  });
}

export async function PUT(request: Request) {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.id !== adminUserId) return Response.json({ error: "Forbidden" }, { status: 403 });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured" }, { status: 503 });
  const { id, type, username, display_name, bio, avatar_url, site_image_url, is_pinned, pin_label, is_premium, premium_until, badge_keys, ban_duration } = await request.json() as {
    type?: "profile" | "settings" | "pin-story" | "premium-profile" | "manual-badges" | "account-suspension" | "password-reset";
    id?: string;
    username?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string | null;
    site_image_url?: string | null;
    is_pinned?: boolean;
    pin_label?: string | null;
    is_premium?: boolean;
    premium_until?: string | null;
    badge_keys?: string[];
    ban_duration?: string;
  };
  if (type === "account-suspension") {
    const allowedDurations = new Set(["24h", "168h", "720h", "876000h", "none"]);
    if (id === adminUserId) return Response.json({ error: "The owner account cannot be suspended from this panel" }, { status: 400 });
    if (!id || typeof ban_duration !== "string" || !allowedDurations.has(ban_duration)) {
      return Response.json({ error: "id and a supported suspension duration are required" }, { status: 400 });
    }
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await admin.auth.admin.updateUserById(id, { ban_duration });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  }
  if (type === "password-reset") {
    if (!id) return Response.json({ error: "A user id is required" }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!publicKey) return Response.json({ error: "Supabase public key is not configured" }, { status: 503 });
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(id);
    if (authUserError || !authUser.user.email) return Response.json({ error: "Could not find an email for this account" }, { status: 404 });
    const recoveryClient = createClient(url, publicKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await recoveryClient.auth.resetPasswordForEmail(authUser.user.email);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  }
  if (type === "manual-badges") {
    if (!id || !Array.isArray(badge_keys) || badge_keys.some((badge) => !profileBadgeKeys.has(badge)) || new Set(badge_keys).size !== badge_keys.length) {
      return Response.json({ error: "id and valid manual badge keys are required" }, { status: 400 });
    }
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error: deleteError } = await admin.from("profile_badges").delete().eq("profile_id", id);
    if (deleteError) return Response.json({ error: deleteError.message }, { status: 400 });
    if (badge_keys.length) {
      const { error } = await admin.from("profile_badges").insert(badge_keys.map((badge_key) => ({ profile_id: id, badge_key, awarded_by: user.id })));
      if (error) return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ ok: true });
  }
  if (type === "premium-profile") {
    if (!id || typeof is_premium !== "boolean") return Response.json({ error: "id and is_premium are required" }, { status: 400 });
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const expiry = premium_until ? new Date(premium_until).toISOString() : null;
    const { error } = await admin.from("profiles").update({ is_premium, premium_until: is_premium ? expiry : null }).eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  }
  if (type === "settings") {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await admin.from("site_settings").upsert({ id: true, site_image_url: site_image_url?.trim() || null, updated_at: new Date().toISOString() });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  }
  if (type === "pin-story") {
    if (!id || typeof is_pinned !== "boolean") return Response.json({ error: "id and is_pinned are required" }, { status: 400 });
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await admin.from("stories").update({ is_pinned, pin_label: is_pinned ? pin_label?.trim().slice(0, 40) || "Pinned" : null }).eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true });
  }
  if (!id || !username || !display_name) return Response.json({ error: "id, username, and display_name are required" }, { status: 400 });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await admin.from("profiles").update({
    username: username.trim().toLowerCase(),
    display_name: display_name.trim(),
    bio: (bio ?? "").trim(),
    avatar_url: avatar_url ?? null,
  }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.id !== adminUserId) return Response.json({ error: "Forbidden" }, { status: 403 });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured" }, { status: 503 });
  const { type, id } = await request.json() as { type?: "story" | "profile"; id?: string };
  if (!type || !id) return Response.json({ error: "type and id are required" }, { status: 400 });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  if (type === "story") {
    const { error } = await admin.from("stories").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
  } else {
    const { error: deleteError } = await admin.auth.admin.deleteUser(id);
    if (deleteError) return Response.json({ error: deleteError.message }, { status: 400 });
  }
  return Response.json({ ok: true });
}
