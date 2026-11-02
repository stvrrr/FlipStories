import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import HomePage from "./_components/site-app";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ story?: string | string[] }> }): Promise<Metadata> {
  const { story: storyParam } = await searchParams;
  const storyId = Array.isArray(storyParam) ? storyParam[0] : storyParam;
  if (!storyId) return {};

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return {};

  try {
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: story } = await admin
      .from("stories")
      .select("id,title,excerpt,profiles!stories_author_id_fkey(display_name)")
      .eq("id", storyId)
      .eq("status", "published")
      .eq("visibility", "public")
      .maybeSingle();
    if (!story) return {};

    const profile = Array.isArray(story.profiles) ? story.profiles[0] : story.profiles;
    const author = profile?.display_name ?? "Flip Stories writer";
    const description = story.excerpt?.trim() || `A story by ${author} on Flip Stories.`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://flipstories.vercel.app";
    const canonicalUrl = `${siteUrl}/?story=${encodeURIComponent(story.id ?? storyId)}`;
    const imageUrl = `${siteUrl}/api/story-preview?story=${encodeURIComponent(story.id ?? storyId)}`;

    return {
      title: `${story.title} by ${author} | Flip Stories`,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: "article",
        title: story.title,
        description,
        url: canonicalUrl,
        siteName: "Flip Stories",
        images: [{ url: imageUrl, width: 1200, height: 630, alt: story.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: story.title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {};
  }
}

export default function DiscoverPage() {
  return <HomePage initialView="Discover" />;
}
