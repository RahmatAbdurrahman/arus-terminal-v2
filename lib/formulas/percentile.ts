/**
 * Ranking persentil — dasar dari SMFI dan Divergence Delta.
 *
 * Kenapa persentil, bukan z-score atau ambang absolut: data finansial
 * berekor panjang, beberapa hari ekstrem bisa bikin rata-rata dan standar
 * deviasi jadi nggak stabil. Persentil (ranking relatif terhadap universe
 * hari yang sama) jauh lebih tahan outlier. Lihat PRD.md bagian 4.
 */

/**
 * Mengembalikan persentil (0-100) tiap elemen `values` relatif terhadap
 * seluruh array itu sendiri. NaN/undefined diperlakukan sebagai "tidak ikut
 * di-ranking" — hasilnya NaN juga, si pemanggil wajib menangani ini
 * (jangan pernah membiarkan NaN lolos sampai ke tampilan).
 */
export function percentileRank(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) return [values[0] === undefined || Number.isNaN(values[0]) ? NaN : 50];

  const indexed = values.map((v, i) => ({ v, i }));
  const valid = indexed.filter((x) => Number.isFinite(x.v));
  const sorted = [...valid].sort((a, b) => a.v - b.v);

  const rankOf = new Map<number, number>();
  sorted.forEach((item, rank) => {
    // rank 0..len-1 -> persentil 0..100, pakai rata-rata rank kalau ada nilai kembar
    rankOf.set(item.i, rank);
  });

  // Tangani nilai kembar: rata-ratakan rank-nya (standar "competition"->"mean rank")
  const groups = new Map<number, number[]>();
  sorted.forEach((item, rank) => {
    const arr = groups.get(item.v) ?? [];
    arr.push(rank);
    groups.set(item.v, arr);
  });
  const meanRankOf = new Map<number, number>();
  groups.forEach((ranks, v) => {
    const mean = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    meanRankOf.set(v, mean);
  });

  const denom = valid.length > 1 ? valid.length - 1 : 1;

  return indexed.map(({ v, i }) => {
    if (!Number.isFinite(v)) return NaN;
    const mean = meanRankOf.get(v) ?? rankOf.get(i) ?? 0;
    return (mean / denom) * 100;
  });
}

/** Rata-rata sederhana, mengabaikan NaN/undefined. Null kalau tidak ada data valid. */
export function mean(values: number[]): number | null {
  const valid = values.filter((v) => Number.isFinite(v));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}
