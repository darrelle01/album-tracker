export default async function handler(req, res) {
  const q = String(req.query?.q ?? "").trim().slice(0, 200);
  if (!q) return res.status(400).json({ error: "Missing search text." });

  try {
    const r = await fetch(
      `https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=5`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      },
    );
    if (!r.ok) {
      console.error("Deezer error:", r.status, await r.text());
      return res.status(502).json({
        error: "Deezer is unavailable.",
        upstreamStatus: r.status,
      });
    }

    const data = await r.json();
    if (data.error)
      return res.status(502).json({ error: "Deezer returned an error." });

    const albums = (data.data ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      artist: a.artist?.name ?? "",
    }));

    // Albums rarely change, so let the host cache results for a day
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    return res.status(200).json({ albums });
  } catch {
    return res.status(500).json({ error: "Something went wrong." });
  }
}
