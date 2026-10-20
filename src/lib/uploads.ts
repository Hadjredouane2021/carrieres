import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const imageTypes: Record<string, { ext: string; check: (bytes: Uint8Array) => boolean }> = {
  "image/jpeg": { ext: "jpg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  "image/webp": {
    ext: "webp",
    check: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45,
  },
};

export async function savePublicImage(file: File, maxBytes = 3 * 1024 * 1024) {
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(`L'image doit peser moins de ${Math.round(maxBytes / (1024 * 1024))} Mo.`);
  }
  const kind = imageTypes[file.type];
  if (!kind) throw new Error("Formats acceptés : JPG, PNG ou WebP.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!kind.check(bytes)) throw new Error("Le fichier image est illisible.");
  const name = `${randomBytes(16).toString("hex")}.${kind.ext}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return `/uploads/${name}`;
}

export async function saveCv(file: File) {
  if (file.size <= 0) return "";
  if (file.size > 2 * 1024 * 1024) throw new Error("Le CV doit peser moins de 2 Mo.");
  if (file.type !== "application/pdf") throw new Error("Le CV doit être un PDF.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (!header.startsWith("%PDF")) throw new Error("Le fichier PDF est illisible.");
  const name = `${randomBytes(16).toString("hex")}.pdf`;
  const directory = path.join(process.cwd(), "storage", "cv");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
  return name;
}
