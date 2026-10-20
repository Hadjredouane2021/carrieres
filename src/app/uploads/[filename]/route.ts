import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const match = /^[a-f0-9]{32}\.(jpg|png|webp)$/.exec(filename);
  if (!match) return new NextResponse("Introuvable", { status: 404 });

  try {
    const image = await readFile(path.join(process.cwd(), "public", "uploads", filename));
    return new NextResponse(image, {
      headers: {
        "Content-Type": contentTypes[match[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return new NextResponse("Introuvable", { status: 404 });
    }
    throw error;
  }
}
