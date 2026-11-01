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
    admin.from("profiles").select("id,username,display_name,bio,avatar_url,created_at,is_premium,premium_until").order("created_at", { ascending: false }),
    admin.from("stories").select("id,title,status,visibility,author_id,created_at,is_pinned,pin_label,profiles!stories_author_id_fkey(id)").order("created_at", { ascending: false }),
    admin.from("site_settings").select("site_image_url").eq("id", true).maybeSingle(),
    admin.from("profile_badges").select("profile_id,badge_key"),
  ]);
  if (usersError) return Response.json({ error: `Could not load users: ${usersError.message}` }, { status: 500 });
  if (settingsError) return Response.json({ error: `Could not load site settings: ${settingsError.message}` }, { status: 500 });
  if (badgeError) return Response.json({ error: `Could not load profile badges: ${badgeError.message}` }, { status: 500 });
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
    users: (users ?? []).map((profile) => ({ ...profile, manual_badges: manualBadgesByProfile.get(profile.id) ?? [] })),
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
  const { id, type, username, display_name, bio, avatar_url, site_image_url, is_pinned, pin_label, is_premium, premium_until, badge_keys } = await request.json() as {
    type?: "profile" | "settings" | "pin-story" | "premium-profile" | "manual-badges";
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
  };
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
    const { error } = await admin.from("profiles").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ ok: true });
}
