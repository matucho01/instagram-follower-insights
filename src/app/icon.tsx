import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 30% 30%, #34d399, #0f766e 65%, #0f172a)",
          fontSize: 220,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          color: "#f8fafc",
          borderRadius: "25%",
        }}
      >
        IF
      </div>
    ),
    size
  );
}
