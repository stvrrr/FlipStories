import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname === "cdn.discordapp.com" || url.hostname === "media.discordapp.net") {
      url.pathname = url.pathname.replace(/\.webp$/, ".png");
      url.searchParams.delete("format");
      url.searchParams.set("format", "png");
    }
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function avatarDataUrl(value: string | null) {
  const url = safeUrl(value);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "FlipStories-Ship-Image/1.0" },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type")?.split(";")[0] ?? "image/png";
    if (!contentType.startsWith("image/")) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const leftName = (params.get("leftName") ?? "User 1").slice(0, 32);
  const rightName = (params.get("rightName") ?? "User 2").slice(0, 32);
  const parsedRate = Number(params.get("rate"));
  const rate = Number.isFinite(parsedRate) ? Math.max(0, Math.min(100, Math.round(parsedRate))) : 0;
  const placeholderAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Crect width='220' height='220' fill='%235A506C'/%3E%3Ccircle cx='110' cy='82' r='42' fill='%23FFFFFF' fill-opacity='.7'/%3E%3Ccircle cx='110' cy='205' r='78' fill='%23FFFFFF' fill-opacity='.7'/%3E%3C/svg%3E";
  const leftAvatar = (await avatarDataUrl(params.get("leftAvatar"))) ?? placeholderAvatar;
  const rightAvatar = (await avatarDataUrl(params.get("rightAvatar"))) ?? placeholderAvatar;
  const matchLabel = rate >= 91 ? "Soulmates!" : rate >= 70 ? "Great match!" : rate >= 40 ? "Possible..." : "Maybe not";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 45,
          color: "#fff",
          position: "relative",
          background: "linear-gradient(135deg, #fff0f6 0%, #ffc2d8 48%, #ff8fab 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", left: 32, top: 25, display: "flex", fontSize: 54, color: "#ffffff99" }}>♥</div>
        <div style={{ position: "absolute", right: 38, bottom: 24, display: "flex", fontSize: 68, color: "#ffffff99" }}>♥</div>
        <div style={{ position: "absolute", left: 70, bottom: 55, display: "flex", fontSize: 28, color: "#ffffff88" }}>♥</div>
        <div style={{ position: "absolute", right: 105, top: 38, display: "flex", fontSize: 34, color: "#ffffff88" }}>♥</div>
        <div style={{ width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ width: 220, height: 220, display: "flex" }}>
            <img src={leftAvatar} width={220} height={220} style={{ borderRadius: 110, border: "8px solid #fff", boxShadow: "0 18px 45px rgba(167, 37, 84, 0.28)" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#743653" }}>{leftName}</div>
        </div>

        <div style={{ width: 330, height: 330, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 165, background: "rgba(255,255,255,.62)", border: "6px solid rgba(255,255,255,.92)", boxShadow: "0 24px 70px rgba(167, 37, 84, 0.2)" }}>
          <div style={{ display: "flex", fontSize: 82, color: "#ed4b86" }}>♥</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#743653" }}>{rate}%</div>
          <div style={{ display: "flex", fontSize: 28, color: "#b34270" }}>{matchLabel}</div>
        </div>

        <div style={{ width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ width: 220, height: 220, display: "flex" }}>
            <img src={rightAvatar} width={220} height={220} style={{ borderRadius: 110, border: "8px solid #fff", boxShadow: "0 18px 45px rgba(167, 37, 84, 0.28)" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#743653" }}>{rightName}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
