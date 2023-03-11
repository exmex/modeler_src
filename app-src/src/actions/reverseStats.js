export const IMPORT_REVERSE_STATS = "import_reverse_stats";

export function importReverseStats(reverseStats) {
  return {
    type: IMPORT_REVERSE_STATS,
    payload: reverseStats
  };
}
