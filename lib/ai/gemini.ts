/**
 * Lapisan AI — PRD.md bagian 9. "AI menulis dalam batas ketat, kode
 * menghitung semuanya." Gemini cuma boleh menarasikan angka yang udah
 * dihitung kode, nggak pernah menghitung atau memutuskan apa pun.
 *
 * Server-side saja.
 */

const FORBIDDEN_WORDS = [
  "beli", "jual", "rekomendasi", "target", "sebaiknya", "disarankan",
  "hindari", "potensi keuntungan", "waspada", "perlu dipertimbangkan",
];

export interface ExplainInput {
  ticker: string;
  smfi: number;
  divergenceDelta: number;
  confluence: "akumulasi_senyap" | "sudah_di_harga" | "distribusi" | "sinyal_sedang";
}

export interface ExplainOutput {
  narrative: string;
  source: "gemini" | "template";
}

function templateFallback(input: ExplainInput): string {
  const arah = input.divergenceDelta >= 0 ? "arus masuk lebih kuat dibanding pergerakan harganya" : "harga sudah bergerak lebih dulu dibanding arusnya";
  return `${input.ticker} punya SMFI ${input.smfi} dari 100 dan Divergence Delta ${input.divergenceDelta}. Ini berarti ${arah}. Lihat halaman metodologi buat detail cara hitungnya.`;
}

function buildPrompt(input: ExplainInput): string {
  return `Kamu menulis SATU paragraf pendek bahasa Indonesia (maks 3 kalimat) buat pengguna terminal saham, menjelaskan angka berikut. Jangan menghitung apa pun sendiri, jangan menyebut angka yang tidak ada di data ini.

Data:
- Ticker: ${input.ticker}
- SMFI (skor akumulasi institusi/asing, 0-100): ${input.smfi}
- Divergence Delta (selisih persentil arus vs perubahan harga, -100 s/d 100): ${input.divergenceDelta}
- Label: ${input.confluence}

Aturan mutlak:
- Dilarang memakai kata: beli, jual, rekomendasi, target, sebaiknya, disarankan, hindari
- Nada netral, jelaskan APA yang terjadi, jangan menyuruh melakukan apa pun
- Sapa dengan "kamu" kalau perlu, tapi boleh juga tanpa sapaan
- Output JSON murni: {"narrative": "..."}, tanpa markdown, tanpa penjelasan tambahan`;
}

function extractNumbers(text: string): number[] {
  const matches = text.match(/-?\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

/** Validasi wajib — PRD.md bagian 9. Gagal validasi = tolak, jangan ditampilkan. Diekspor buat unit test. */
export function validate(narrative: string, input: ExplainInput): boolean {
  const lower = narrative.toLowerCase();
  if (FORBIDDEN_WORDS.some((w) => lower.includes(w))) return false;
  if (narrative.length > 500 || narrative.length < 10) return false;

  const allowedNumbers = new Set([input.smfi, Math.abs(input.divergenceDelta), input.divergenceDelta]);
  const numbersInText = extractNumbers(narrative);
  for (const n of numbersInText) {
    if (!allowedNumbers.has(n) && !allowedNumbers.has(-n)) return false; // angka baru yang nggak ada di input = tolak
  }

  // Cek arah: kalau divergence negatif (harga duluan gerak), narasi nggak
  // boleh pakai kata yang menyiratkan arus "lebih dulu" atau "unggul".
  if (input.divergenceDelta < 0 && /arus.{0,20}(lebih dulu|mendahului|unggul)/i.test(narrative)) return false;
  if (input.divergenceDelta >= 0 && /harga.{0,20}(lebih dulu|mendahului|unggul)/i.test(narrative)) return false;

  return true;
}

async function callGemini(apiKey: string, input: ExplainInput): Promise<string | null> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

/**
 * Rapor/narasi harus tetap terkirim meski Gemini mati total — PRD.md
 * bagian 9. Retry pendek buat 503 ("biasanya sementara" kata Google
 * sendiri), tapi ini fitur interaktif (tombol diklik pengguna), jadi
 * jangan nunggu kelamaan — 2 percobaan cukup, bukan backoff panjang
 * kayak proses ingest di background.
 */
export async function explainScore(input: ExplainInput): Promise<ExplainOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { narrative: templateFallback(input), source: "template" };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callGemini(apiKey, input);
      if (!text) {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }
        break;
      }

      const parsed = JSON.parse(text);
      const narrative: string = parsed.narrative ?? "";
      if (!validate(narrative, input)) break;

      return { narrative, source: "gemini" };
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
      break;
    }
  }

  return { narrative: templateFallback(input), source: "template" };
}
