import { NextResponse } from "next/server";

interface ScoreEntry {
  pseudo: string;
  score: number;
  date: number;
}

const KEY = process.env.LEADERBOARD_KV_KEY?.trim() || "vtc-site-leaderboard";

async function getKV() {
  try {
    const mod = await import("@vercel/kv");
    return mod.kv;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const kv = await getKV();
    if (!kv) return NextResponse.json([]);
    const scores: ScoreEntry[] = (await kv.get(KEY)) || [];
    return NextResponse.json(scores);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { pseudo, score } = await req.json();
    if (!pseudo || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const kv = await getKV();
    if (!kv) {
      return NextResponse.json({ error: "Leaderboard not configured" }, { status: 503 });
    }
    let scores: ScoreEntry[] = (await kv.get(KEY)) || [];
    scores.push({
      pseudo: pseudo.slice(0, 10).toUpperCase(),
      score: Math.floor(score),
      date: Date.now(),
    });
    scores.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score);
    scores = scores.slice(0, 5);
    await kv.set(KEY, scores);
    return NextResponse.json(scores);
  } catch {
    return NextResponse.json({ error: "Leaderboard unavailable" }, { status: 503 });
  }
}
