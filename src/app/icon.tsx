import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const logoData = await readFile(
    join(process.cwd(), "public", "logos", "muhammedajmalcom-mark-512.png"),
    "base64",
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ImageResponse requires a native image element; next/image is not supported by Satori. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${logoData}`}
        alt=""
        width={32}
        height={32}
        style={{ objectFit: "contain" }}
      />
    </div>,
    { ...size },
  );
}
