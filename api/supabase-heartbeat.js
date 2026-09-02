const HEARTBEAT_TABLE = "supabase_heartbeat_events";
const EVENT_SOURCE = "vercel-cron";

function json(statusCode, body) {
  return { statusCode, body };
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function supabaseRequest(path, init = {}) {
  const supabaseUrl = requireEnv("VITE_SUPABASE_URL").replace(/\/$/, "");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase ${response.status}: ${details}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export default async function handler(request, response) {
  function send(payload) {
    response.status(payload.statusCode);
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.setHeader("cache-control", "no-store");
    response.end(JSON.stringify(payload.body));
  }

  if (!["GET", "POST"].includes(request.method)) {
    send(json(405, { ok: false, error: "Method not allowed" }));
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.authorization ?? "";
    if (authorization !== `Bearer ${cronSecret}`) {
      send(json(401, { ok: false, error: "Unauthorized" }));
      return;
    }
  }

  try {
    const inserted = await supabaseRequest(HEARTBEAT_TABLE, {
      method: "POST",
      body: JSON.stringify({ source: EVENT_SOURCE }),
    });

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabaseRequest(
      `${HEARTBEAT_TABLE}?source=eq.${encodeURIComponent(EVENT_SOURCE)}&created_at=lt.${encodeURIComponent(cutoff)}`,
      { method: "DELETE", headers: { prefer: "return=minimal" } },
    );

    send(json(200, {
      ok: true,
      insertedId: inserted?.[0]?.id ?? null,
      cleanedBefore: cutoff,
    }));
  } catch (error) {
    send(json(500, { ok: false, error: error.message }));
  }
}
