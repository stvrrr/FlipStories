import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
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
  const leftAvatar = safeUrl(params.get("leftAvatar")) ?? placeholderAvatar;
  const rightAvatar = safeUrl(params.get("rightAvatar")) ?? placeholderAvatar;
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
          background: "linear-gradient(135deg, #191425 0%, #4a183d 55%, #c43d72 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ width: 220, height: 220, display: "flex" }}>
            <img src={leftAvatar} width={220} height={220} style={{ borderRadius: 110, border: "8px solid rgba(255,255,255,.85)" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>{leftName}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", fontSize: 110 }}>♥</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800 }}>{rate}%</div>
          <div style={{ display: "flex", fontSize: 28, color: "#ffd9e7" }}>{matchLabel}</div>
        </div>

        <div style={{ width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ width: 220, height: 220, display: "flex" }}>
            <img src={rightAvatar} width={220} height={220} style={{ borderRadius: 110, border: "8px solid rgba(255,255,255,.85)" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>{rightName}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
