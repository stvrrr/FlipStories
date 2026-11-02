import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const storyId = new URL(request.url).searchParams.get("story");
  if (!storyId) return new Response("Story id is required", { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let title = "A story on Flip Stories";
  let description = "Read stories worth sharing.";
  let author = "Flip Stories";

  if (url && serviceKey) {
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: story } = await admin
      .from("stories")
      .select("title,excerpt,profiles!stories_author_id_fkey(display_name)")
      .eq("id", storyId)
      .eq("status", "published")
      .eq("visibility", "public")
      .maybeSingle();

    if (story) {
      title = story.title;
      description = story.excerpt ?? description;
      const profile = Array.isArray(story.profiles) ? story.profiles[0] : story.profiles;
      author = profile?.display_name ?? author;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#29251f",
          background: "#f5f1e8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontFamily: "sans-serif", fontSize: 26, letterSpacing: 2, color: "#7b715f" }}>FLIP STORIES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 980 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05 }}>{title.slice(0, 120)}</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 31, lineHeight: 1.35, color: "#625b50" }}>{description.slice(0, 180)}</div>
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: 27, color: "#925b47" }}>By {author}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
