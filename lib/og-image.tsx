import { ImageResponse } from "next/og";

export const OG_IMAGE_ALT = "Drive Right Motors — Pre-Owned Vehicles in Miami";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0A0A0B",
          padding: "88px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#A1A1A6",
            marginBottom: 32,
          }}
        >
          Pre-Owned Vehicles — Miami
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: "#F4F4F1",
          }}
        >
          DRIVE RIGHT
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: "#FFB020",
          }}
        >
          MOTORS
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
