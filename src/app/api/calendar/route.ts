import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title") || "Anime Episode";
  const begin = searchParams.get("begin");
  const end = searchParams.get("end");
  const notes = searchParams.get("notes") || "";
  const url = searchParams.get("url") || "";

  if (!begin || !end) {
    return NextResponse.json({ error: "begin and end parameters required" }, { status: 400 });
  }

  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZyniVerse//Anime Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${begin}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${notes}
URL:${url}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return new NextResponse(icalContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, "_")}.ics"`,
    },
  });
}
