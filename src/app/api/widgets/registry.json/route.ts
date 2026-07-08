import { NextResponse } from "next/server";
import { getAllWidgets } from "@/lib/widget-registry";

export async function GET() {
  const widgets = getAllWidgets();
  return NextResponse.json({ widgets, version: "1.0.0", generatedAt: new Date().toISOString() });
}
