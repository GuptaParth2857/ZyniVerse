import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/analytics";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
