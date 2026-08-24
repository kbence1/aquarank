"use client";
import { FormEvent, useEffect, useState } from "react";
import type { EventData, Result } from "../../lib/data";
import { Header } from "../../components/Header";

async function post(body: Record<string, unknown>) {
  const response = await fetch("/api/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function ArchivedResultsEditor({ eventId, results, busy, onSave, onAdd }: { eventId: number; results: Result[]; busy: number | null; onSave: (event: FormEvent<HTMLFormElement>, resultId: number) => void; onAdd: (event: FormEvent<HTMLFormElement>, eventId: number) => void }) {
  return <section className="archiveResultEditor">
    <div className="archiveResultHead"><span>RANK</span><span>COMPETITOR</span><span>NATION</span><span>TIME</span><span>POINTS</span><span>ACTION</span></div>
    <form className="archiveAddResult" onSubmit={event => onAdd(event, eventId)}>
      <b className="archiveResultRank">+</b>
      <input name="athlete" placeholder="Competitor" aria-label="New competitor name" required />
      <input name="club" placeholder="Nation" aria-label="New competitor nation" required />
      <input name="time" placeholder="MM:SS" pattern="[0-9]{2}:[0-5][0-9]" aria-label="New result time" required />
      <input name="points" placeholder="Points" type="number" min="0" aria-label="New result points" required />
      <button type="submit" disabled={busy === -eventId}>{busy === -eventId ? "Adding…" : "Add result"}</button>
    </form>
    {results.map((result, index) => <form key={result.id} onSubmit={event => onSave(event, result.id)}>
      <b className="archiveResultRank">{index + 1}</b>
      <input name="athlete" defaultValue={result.athlete} aria-label={"Competitor name, row " + (index + 1)} required />
      <input name="club" defaultValue={result.club} aria-label={"Nation, row " + (index + 1)} required />
      <input name="time" defaultValue={result.time} pattern="[0-9]{2}:[0-5][0-9]" aria-label={"Time, row " + (index + 1)} required />
      <input name="points" defaultValue={result.points} type="number" min="0" aria-label={"Points, row " + (index + 1)} required />
      <button type="submit" disabled={busy === result.id}>{busy === result.id ? "Saving…" : "Update"}</button>
    </form>)}
    {results.length === 0 && <p>No recorded results yet. Use the row above to add one.</p>}
  </section>;
}

export default function ArchiveAdmin() {
  const [logged, setLogged] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const archived = (data: { events: EventData[] }) => setEvents(data.events.filter(item => !item.isLive));
  async function load() { const response = await fetch("/api/data", { cache: "no-store" }); archived(await response.json()); }
  useEffect(() => { load(); post({ action: "check" }).then(() => setLogged(true)).catch(() => {}); }, []);
  async function login(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await post({ action: "login", password: form.get("password") }); setLogged(true); setError(""); } catch (reason) { setError((reason as Error).message); } }
  async function setOfficial(event: EventData, isOfficial: boolean) { try { archived(await post({ action: "setOfficialStatus", eventId: event.id, isOfficial })); showNotice(isOfficial ? "Results marked official" : "Results marked unofficial"); } catch (reason) { setError((reason as Error).message); } }
  async function saveDetails(event: FormEvent<HTMLFormElement>, eventId: number) { event.preventDefault(); setBusy(eventId); setError(""); try { const fields = Object.fromEntries(new FormData(event.currentTarget)); archived(await post({ action: "updateArchivedEvent", eventId, ...fields })); showNotice("Archive entry updated"); } catch (reason) { setError((reason as Error).message); } finally { setBusy(null); } }
  async function saveResult(event: FormEvent<HTMLFormElement>, resultId: number) { event.preventDefault(); setBusy(resultId); setError(""); try { const fields = Object.fromEntries(new FormData(event.currentTarget)); archived(await post({ action: "updateArchivedResult", resultId, ...fields })); showNotice("Result updated"); } catch (reason) { setError((reason as Error).message); } finally { setBusy(null); } }
  async function addResult(event: FormEvent<HTMLFormElement>, eventId: number) { event.preventDefault(); const formElement = event.currentTarget; setBusy(-eventId); setError(""); try { const fields = Object.fromEntries(new FormData(formElement)); archived(await post({ action: "addArchivedResult", eventId, ...fields })); formElement.reset(); showNotice("Result added"); } catch (reason) { setError((reason as Error).message); } finally { setBusy(null); } }
  async function deleteEvent(event: EventData) { if (!confirm("Permanently delete " + event.title + ", all of its results and its PDF?")) return; setBusy(event.id); setError(""); try { archived(await post({ action: "deleteArchivedEvent", eventId: event.id })); showNotice("Archive entry deleted"); } catch (reason) { setError((reason as Error).message); } finally { setBusy(null); } }
  async function upload(event: FormEvent<HTMLFormElement>, eventId: number) { event.preventDefault(); const formElement = event.currentTarget; setBusy(eventId); setError(""); try { const form = new FormData(formElement); form.set("eventId", String(eventId)); const response = await fetch("/api/archive-pdf", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Upload failed"); archived(data); showNotice("PDF uploaded"); formElement.reset(); } catch (reason) { setError((reason as Error).message); } finally { setBusy(null); } }
  async function removePdf(eventId: number) { setBusy(eventId); try { const response = await fetch("/api/archive-pdf?eventId=" + eventId, { method: "DELETE" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Delete failed"); archived(data); showNotice("PDF removed"); } catch (reason) { setError((reason as Error).message); } finally { setBusy(null); } }
  function showNotice(message: string) { setNotice(message); setTimeout(() => setNotice(""), 2200); }

  if (!logged) return <main className="adminShell"><Header active="admin" /><section className="loginWrap"><div className="loginPanel"><span className="lockIcon">✦</span><p className="eyebrow">ARCHIVE EDITOR</p><h1>Admin<br /><em>sign in.</em></h1><p>Enter the organizer password to edit archived results and PDFs.</p><form onSubmit={login}><label>Password<input name="password" type="password" required /></label>{error && <span className="formError">{error}</span>}<button className="primary">Sign in <span>→</span></button></form></div><div className="loginAside"><div><b>Archive control.</b><span>Edit results, approve events, attach PDFs, or remove completed events.</span></div></div></section></main>;

  return <main className="adminShell"><Header active="admin" /><section className="adminHead archiveAdminHead"><div><span className="eyebrow">ORGANIZER PORTAL</span><h1>Archive<br /><em>editor.</em></h1></div><a className="adminBack" href="/admin">← Results management</a></section>{notice && <div className="toast">✓ {notice}</div>}<section className="archiveAdminList">{error && <div className="formError">{error}</div>}{events.length === 0 && <div className="adminCard"><h2>No archived events</h2><p>Completed events will appear here.</p></div>}{events.map(item => <article className="archiveAdminCard archiveEditableCard" key={item.id}><form className="archiveDetailsForm" onSubmit={event => saveDetails(event, item.id)}><span className="cardNo">EVENT DETAILS</span><label>Event name<input name="title" defaultValue={item.title} required /></label><label>Category<input name="category" defaultValue={item.category} required /></label><label>Location<input name="location" defaultValue={item.location} required /></label><label>Date<input name="eventDate" type="date" defaultValue={item.eventDate} required /></label><button className="secondary" disabled={busy === item.id}>{busy === item.id ? "Saving…" : "Update details"}</button></form><div className="archiveStatusControl"><label className="archiveOfficialToggle"><input type="checkbox" role="switch" checked={Boolean(item.isOfficial)} onChange={change => setOfficial(item, change.target.checked)} /><span><b>{item.isOfficial ? "Official" : "Unofficial"}</b><small>Result status</small></span></label><button className="archiveDeleteEvent" type="button" onClick={() => deleteEvent(item)} disabled={busy === item.id}>Delete event</button></div><div className="archivePdfControl">{item.pdfName && <div className="currentPdf"><a href={"/api/archive-pdf?eventId=" + item.id} target="_blank" rel="noreferrer">↗ {item.pdfName}</a><button type="button" onClick={() => removePdf(item.id)} disabled={busy === item.id}>Remove</button></div>}<form onSubmit={form => upload(form, item.id)}><label>{item.pdfName ? "Replace PDF" : "Upload result PDF"}<input name="file" type="file" accept="application/pdf,.pdf" required /></label><button className="secondary" disabled={busy === item.id}>{busy === item.id ? "Working…" : "Save PDF"}</button></form></div>{!item.bracket && <ArchivedResultsEditor eventId={item.id} results={item.results} busy={busy} onSave={saveResult} onAdd={addResult} />}</article>)}</section></main>;
}
