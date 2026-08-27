import { NextResponse } from "next/server";
import { setLiveBrackets, addArchivedResult, addEvent, addResult, deleteArchivedEvent, deleteResult, getEvents, placeBracketSlot, seedBracket, setBracketStartTime, setOfficialStatus, updateArchivedEvent, updateArchivedResult } from "../../lib/data";
import { adminCookie, adminToken, isAdmin } from "../../lib/adminAuth";
import { deleteArchivePdf } from "../../lib/archiveFiles";

export async function GET() { return NextResponse.json({ events: await getEvents() }, { headers: { "Cache-Control": "no-store" } }); }

export async function POST(req: Request) {
  const b = await req.json() as Record<string, unknown>;
  if (b.action === "login") {
    if (b.password !== (process.env.ADMIN_PASSWORD || "aquarank-demo")) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", adminCookie(await adminToken()));
    return res;
  }
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (b.action === "setLiveBrackets") { if (!Array.isArray(b.eventIds)) throw new Error("Select knockout brackets"); await setLiveBrackets(b.eventIds.map(Number)); }
    if (b.action === "addArchivedResult") await addArchivedResult({ eventId: Number(b.eventId), athlete: String(b.athlete || ""), club: String(b.club || ""), time: String(b.time || ""), points: Number(b.points) });
    if (b.action === "addResult") await addResult({ eventId: Number(b.eventId), athlete: String(b.athlete || ""), club: String(b.club || ""), time: String(b.time || "").replace(/\..*$/, "").slice(0, 5), points: Number(b.points) });
    if (b.action === "addEvent") await addEvent({ title: String(b.title || ""), category: String(b.category || ""), location: String(b.location || ""), eventDate: String(b.eventDate || ""), nextStart: String(b.nextStart || ""), eventType: String(b.eventType || "standard"), bracketSize: Number(b.bracketSize || 0) });
    if (b.action === "seedBracket") await seedBracket(Number(b.eventId), String(b.names || "").split(/\r?\n/));
    if (b.action === "placeBracketSlot") await placeBracketSlot(Number(b.eventId), Number(b.targetRound), Number(b.targetPosition), String(b.athlete || ""));
    if (b.action === "setBracketStartTime") await setBracketStartTime(Number(b.eventId), Number(b.round), Number(b.position), String(b.startTime || ""));
    if (b.action === "setOfficialStatus") await setOfficialStatus(Number(b.eventId), Boolean(b.isOfficial));
    if (b.action === "deleteResult") await deleteResult(Number(b.id));
    if (b.action === "updateArchivedEvent") await updateArchivedEvent({ eventId: Number(b.eventId), title: String(b.title || ""), category: String(b.category || ""), location: String(b.location || ""), eventDate: String(b.eventDate || "") });
    if (b.action === "updateArchivedResult") await updateArchivedResult({ resultId: Number(b.resultId), athlete: String(b.athlete || ""), club: String(b.club || ""), time: String(b.time || ""), points: Number(b.points) });
    if (b.action === "deleteArchivedEvent") { const eventId = Number(b.eventId); await deleteArchivedEvent(eventId); await deleteArchivePdf(eventId); }
    return NextResponse.json({ ok: true, events: await getEvents() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 400 });
  }
}
