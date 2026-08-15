import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

export const dynamic = "force-dynamic";

const EXTENSION_DIR = path.join(process.cwd(), "extension");

export async function GET() {
  try {
    if (!fs.existsSync(EXTENSION_DIR)) {
      return NextResponse.json({ error: "Extension folder not found" }, { status: 404 });
    }

    const zip = new AdmZip();

    const addFiles = (dir: string, base = "") => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        const rel = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          addFiles(full, rel);
        } else {
          zip.addLocalFile(full, path.posix.dirname(rel));
        }
      }
    };
    addFiles(EXTENSION_DIR);

    const buffer = zip.toBuffer();
    const body = new Uint8Array(buffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="zyniverse-extension.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Extension download failed:", e);
    return NextResponse.json({ error: "Failed to create extension zip" }, { status: 500 });
  }
}
