/**
 * "Tanya ARUS" — PRD.md bagian 9. Batas keras: fitur ini menerjemahkan
 * pertanyaan jadi FILTER TERSTRUKTUR, lalu query ke Supabase yang udah
 * ada. TIDAK PERNAH memanggil Sectors API langsung per pertanyaan —
 * kalau itu dilanggar, konsumsi kredit jadi fungsi dari traffic, bukan
 * lagi jadwal yang bisa diprediksi (lihat PRD.md bagian 9 & 17).
 */

export interface QueryFilter {
  subSector: string | null;
  minSmfi: number | null;
  minDivergenceDelta: number | null;
  confluence: "akumulasi_senyap" | "sudah_di_harga" | "distribusi" | "sinyal_sedang" | null;
}

const EMPTY_FILTER: QueryFilter = { subSector: null, minSmfi: null, minDivergenceDelta: null, confluence: null };

function buildPrompt(question: string, subSectors: string[]): string {
  return `Ubah pertanyaan bahasa natural ini jadi filter terstruktur JSON. Ini BUKAN buat menjawab pertanyaan — cuma buat ekstrak parameter filter.

Pertanyaan: "${question}"

Subsektor yang valid (pilih PERSIS salah satu ini kalau relevan, atau null kalau pertanyaan nggak menyebut sektor spesifik): ${subSectors.join(", ")}

Output JSON murni, persis skema ini, tanpa markdown:
{
  "subSector": string | null,
  "minSmfi": number | null,
  "minDivergenceDelta": number | null,
  "confluence": "akumulasi_senyap" | "sudah_di_harga" | "distribusi" | "sinyal_sedang" | null
}

Panduan: "diakumulasi diam-diam"/"belum kelihatan di harga" → confluence "akumulasi_senyap". "distribusi"/"lagi dijual" → confluence "distribusi". "sinyal kuat" → minSmfi 60. Kalau nggak ada indikasi spesifik, biarkan null.`;
}

export function isValidFilter(x: any): x is QueryFilter {
  if (typeof x !== "object" || x === null) return false;
  const okSub = x.subSector === null || typeof x.subSector === "string";
  const okSmfi = x.minSmfi === null || (typeof x.minSmfi === "number" && x.minSmfi >= 0 && x.minSmfi <= 100);
  const okDiv = x.minDivergenceDelta === null || (typeof x.minDivergenceDelta === "number" && x.minDivergenceDelta >= -100 && x.minDivergenceDelta <= 100);
  const validConfluence = ["akumulasi_senyap", "sudah_di_harga", "distribusi", "sinyal_sedang", null];
  const okConf = validConfluence.includes(x.confluence);
  return okSub && okSmfi && okDiv && okConf;
}

export async function translateQuestion(question: string, availableSubSectors: string[]): Promise<QueryFilter> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return EMPTY_FILTER; // nggak ada key = nggak bisa terjemahin, bukan nge-crash

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(question, availableSubSectors) }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        }),
      }
    );
    if (!res.ok) return EMPTY_FILTER;

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return EMPTY_FILTER;

    const parsed = JSON.parse(text);
    if (!isValidFilter(parsed)) return EMPTY_FILTER; // bentuk nggak sesuai skema = jangan dipercaya

    // subSector harus PERSIS cocok sama daftar valid — jangan percaya string bebas dari LLM buat query DB
    if (parsed.subSector && !availableSubSectors.includes(parsed.subSector)) parsed.subSector = null;

    return parsed;
  } catch {
    return EMPTY_FILTER;
  }
}
