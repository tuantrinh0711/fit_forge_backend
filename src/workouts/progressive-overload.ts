export const PROGRESSION_DEFAULTS = {
  minReps: 8,
  maxReps: 12,
  weightIncrement: 2.5,
} as const;

export type LoggedSet = {
  reps: number;
  weight: number;
};

export type RecommendedSet = {
  setNumber: number;
  baselineReps: number;
  baselineWeight: number;
  targetReps: number;
  targetWeight: number;
};

export function recommendNextSets(baseline: LoggedSet[]): RecommendedSet[] {
  if (baseline.length === 0) return [];

  const allSetsReachedTop = baseline.every(
    (set) => set.reps >= PROGRESSION_DEFAULTS.maxReps,
  );

  return baseline.map((set, index) => ({
    setNumber: index + 1,
    baselineReps: set.reps,
    baselineWeight: set.weight,
    targetReps: allSetsReachedTop
      ? PROGRESSION_DEFAULTS.minReps
      : set.reps < PROGRESSION_DEFAULTS.minReps
        ? PROGRESSION_DEFAULTS.minReps
        : Math.min(set.reps + 1, PROGRESSION_DEFAULTS.maxReps),
    targetWeight: allSetsReachedTop
      ? set.weight + PROGRESSION_DEFAULTS.weightIncrement
      : set.weight,
  }));
}

export function meetsProgressionTarget(
  current: LoggedSet[],
  targets: RecommendedSet[],
): boolean {
  return (
    targets.length > 0 &&
    current.length >= targets.length &&
    targets.every((target, index) => {
      const set = current[index];
      return (
        set.weight >= target.targetWeight && set.reps >= target.targetReps
      );
    })
  );
}
