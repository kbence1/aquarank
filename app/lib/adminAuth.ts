const cookieName="aquarank_admin";
export async function adminToken(){const secret=process.env.ADMIN_PASSWORD||"aquarank-demo";const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(`aquarank:${secret}`));return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("")}
function cookie(request:Request){return request.headers.get("cookie")?.split(";").map(x=>x.trim()).find(x=>x.startsWith(cookieName+"="))?.slice(cookieName.length+1)}
export async function isAdmin(request:Request){return cookie(request)===await adminToken()}
export function adminCookie(token:string){return `${cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`}
