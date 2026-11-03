export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Use POST." });

  // Some hosts keep pasted line breaks; use the first non-empty line only.
  const key =
    (process.env.GEMINI_API_KEY ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean)
      ?.replace(/^["']|["']$/g, "") ?? "";
  if (!key) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is missing. Check .env.local and restart.",
    });
  }

  // Clean and cap the incoming taste profile
  const taste = (Array.isArray(req.body?.taste) ? req.body.taste : [])
    .slice(0, 40)
    .map((a) => ({
      title: String(a.title ?? "").slice(0, 120),
      artist: String(a.artist ?? "").slice(0, 120),
      rating: Math.min(5, Math.max(0, Number(a.rating) || 0)),
      status: String(a.status ?? "").slice(0, 20),
    }))
    .filter((a) => a.title && a.artist);

  if (taste.length < 3) {
    return res.status(400).json({
      error: "Save at least 3 albums first so there's a pattern to learn from.",
    });
  }

  // Model names change; override with GEMINI_MODEL if this one is retired.
  const MODEL = (
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
  ).trim();

  // Gemini occasionally answers 503 when a model is busy; one retry is enough.
  const askGemini = async () =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "You are a music recommendation engine. You receive a person's saved albums with a star rating (0 means unrated) and a status (wishlist, listening, listened). " +
                  "Infer their taste from patterns such as genres, eras, moods, and artists. Weight 4-5 star albums most, and steer away from the style of 1-2 star albums. " +
                  "Recommend exactly 6 real, released albums that are NOT in their list. At most 2 may be by artists already in the list. " +
                  'Reply only with JSON: {"albums": [{"title":"","artist":"","reason":""}]}. ' +
                  "Each reason is under 15 words and mentions the pattern it matches. Never include song lyrics.",
              },
            ],
          },
          contents: [{ role: "user", parts: [{ text: JSON.stringify(taste) }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

  try {
    let r = await askGemini();
    if (r.status === 503 || r.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      r = await askGemini();
    }

    if (!r.ok) {
      const detail = await r.text();
      console.error("Gemini error:", r.status, detail);
      return res.status(502).json({
        error: `Gemini returned ${r.status}. Check the terminal for details.`,
      });
    }

    const data = await r.json();
    const raw = (data.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("");
    // Be forgiving if the model wraps its JSON in a markdown code fence.
    const text = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const parsed = JSON.parse(text || "{}");
    return res.status(200).json({
      albums: Array.isArray(parsed.albums) ? parsed.albums : [],
    });
  } catch (err) {
    console.error("Function error:", err);
    return res.status(500).json({
      error: "Something went wrong. Check the terminal for details.",
    });
  }
}
