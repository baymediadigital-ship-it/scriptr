import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Lightning bolt via clip-path polygon on a white div */}
        <div
          style={{
            width: 17,
            height: 21,
            background: "white",
            clipPath:
              "polygon(65% 0%, 18% 52%, 50% 52%, 33% 100%, 83% 46%, 50% 46%, 65% 0%)",
          }}
        />
      </div>
    ),
    { width: 32, height: 32 }
  );
}
