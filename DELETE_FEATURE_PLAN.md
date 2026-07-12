# Delete Feature Technical Plan

## Objective

Allow users to permanently remove fitness records so obsolete data no longer contributes to lists, search, nutrition totals, workout summaries, progress charts, or reports.

## API Contract

Successful deletion returns 204 No Content. A missing record, or a nested record that does not belong to the parent IDs in the route, returns 404 Not Found.

| Resource | Endpoint | Cascade behavior |
| --- | --- | --- |
| Workout | DELETE /api/workouts/:id | Deletes its exercises and sets |
| Workout exercise | DELETE /api/workouts/:id/exercises/:exerciseId | Deletes its sets |
| Workout set | DELETE /api/workouts/:id/exercises/:exerciseId/sets/:setId | None |
| Meal | DELETE /api/nutrition/meals/:id | Deletes its food items |
| Food item | DELETE /api/nutrition/meals/:mealId/foods/:foodId | None |
| Goal | DELETE /api/goals/:id | None |
| Weight entry | DELETE /api/progress/weights/:id | None |
| Training plan | DELETE /api/ai-plans/:id | None |

## Technical Design

- Use Prisma deleteMany with IDs and parent ownership filters so deletion and existence detection happen atomically.
- Return 404 when Prisma reports a deletion count of zero.
- Rely on existing PostgreSQL cascade relations for workout descendants and meal foods.
- Keep child endpoints parent-scoped to prevent deletion through an unrelated parent URL.
- Use hard deletion; no schema or migration changes are required.
- Expose 204 using NestJS HttpCode metadata.

## Client Flow

1. User chooses Delete for a record.
2. Client displays a destructive confirmation naming the affected record.
3. Client sends the DELETE request and disables repeat submission.
4. On 204, client removes the record from local state or reloads the relevant query.
5. On failure, client retains the record and displays a retryable error.

Parent confirmations should mention cascaded children. Avoid optimistic deletion unless the client can restore the record after a request failure.

## Testing Plan

- Verify every endpoint returns 204 with an empty body after successful deletion.
- Verify missing records return 404.
- Verify exercise, set, and food deletion includes parent IDs in its Prisma filter.
- Verify workout deletion cascades to exercises and sets.
- Verify meal deletion cascades to food items.
- Verify deleted records no longer affect search, totals, summaries, charts, or reports.
- Run npm run build, npm test, and npm run test:e2e.

## Database Impact

No Prisma schema or migration changes. Existing cascade relations cover workout-to-exercise, exercise-to-set, and meal-to-food deletion.
