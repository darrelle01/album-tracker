export default function handler(req, res) {
  const key = process.env.GEMINI_API_KEY;

  return res.status(200).json({
    hasKey: Boolean(key),
    keyLength: key?.length ?? 0,
    geminiModel: process.env.GEMINI_MODEL ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    vercelUrl: process.env.VERCEL_URL ?? null,
    projectId: process.env.VERCEL_PROJECT_ID ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
