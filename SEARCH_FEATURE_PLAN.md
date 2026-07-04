# Search Feature Plan

## Objective

Add a global backend search feature that lets clients query fitness records across workouts, workout exercises, meals, food items, goals, weight entries, weekly reports, and AI training plans.

## User Value

Users should be able to quickly find past training sessions, exercises, meals, foods, goals, progress entries, and generated plans without manually browsing each feature area.

## Proposed API

### Global Search

`GET /api/search`

Query parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `q` | string | Yes | Search text. Trim whitespace and require at least 2 characters. |
| `type` | string | No | Optional content type filter. Values: `workout`, `exercise`, `meal`, `food`, `goal`, `weight`, `training_plan`. |
| `limit` | number | No | Page size. Default `20`, maximum `50`. |
| `offset` | number | No | Number of records to skip. Default `0`. |

Example:

```http
GET /api/search?q=bench&type=exercise&limit=10&offset=0
```

Response shape:

```json
{
  "query": "bench",
  "limit": 10,
  "offset": 0,
  "total": 2,
  "results": [
    {
      "id": "uuid",
      "type": "exercise",
      "title": "Bench Press",
      "summary": "Exercise in Push Day workout",
      "date": "2026-07-04T07:00:00.000Z",
      "metadata": {
        "workoutId": "uuid"
      }
    }
  ]
}
```

## Backend Design

Create a new `SearchModule` with:

| File | Purpose |
| --- | --- |
| `src/search/search.module.ts` | Register the search feature. |
| `src/search/search.controller.ts` | Expose `GET /api/search`. |
| `src/search/search.service.ts` | Run Prisma queries and normalize results. |
| `src/search/dto/search-query.dto.ts` | Validate `q`, `type`, `limit`, and `offset`. |

Register `SearchModule` in `src/app.module.ts`.

## Search Scope

Initial searchable fields:

| Type | Prisma model | Fields |
| --- | --- | --- |
| `workout` | `Workout` | `name` |
| `exercise` | `WorkoutExercise` | `name`, `exerciseId`, `notes` |
| `meal` | `Meal` | `name` |
| `food` | `FoodItem` | `name` |
| `goal` | `Goal` | `type` |
| `weight` | `WeightEntry` | `weight` as text-compatible metadata only; filter by type rather than full text if needed |
| `training_plan` | `TrainingPlan` | `goal`, `experienceLevel`, `plan` |

Use Prisma `contains` filters with `mode: "insensitive"` for text fields. For `TrainingPlan.plan`, search array text using PostgreSQL support if Prisma can express it cleanly; otherwise search `goal` and `experienceLevel` first, then add plan-body search in a follow-up migration.

## Result Normalization

Every result should return:

| Field | Description |
| --- | --- |
| `id` | Source record ID. |
| `type` | Stable result type. |
| `title` | Human-readable primary label. |
| `summary` | Short contextual text. |
| `date` | Best available timestamp for sorting and display. |
| `metadata` | Type-specific IDs or numeric values needed by clients. |

Sort combined results by relevance first, then newest date. For the first version, use simple relevance:

1. Exact title match.
2. Title starts with query.
3. Title contains query.
4. Summary or secondary field contains query.
5. Newer records first inside the same rank.

## Validation And Errors

Return `400 Bad Request` when:

* `q` is missing or shorter than 2 characters after trimming.
* `type` is not one of the supported values.
* `limit` or `offset` is not numeric.
* `limit` is greater than `50`.

Return an empty result set when the query is valid but no records match.

## Swagger Documentation

Add Swagger decorators for:

* Endpoint summary and description.
* Query parameter examples.
* Supported `type` enum values.
* Response example with grouped result metadata.

Verify the generated docs at:

```text
http://localhost:3000/api/docs
http://localhost:3000/api/docs-json
```

## Testing Plan

Add unit tests for `SearchService`:

* Searches workouts by partial name.
* Searches workout exercises by name and notes.
* Searches meals and foods by name.
* Filters by `type`.
* Applies `limit` and `offset`.
* Returns normalized result fields.
* Rejects invalid query parameters through DTO validation.

Add e2e tests for `GET /api/search`:

* Valid query returns `200`.
* Empty query returns `400`.
* Unknown type returns `400`.
* No matches returns `200` with `total: 0` and `results: []`.

Run before PR:

```bash
npm run build
npm test
npm run test:e2e
```

## Implementation Steps

1. Add the search user story to `User Story.md`.
2. Create `SearchModule`, `SearchController`, `SearchService`, and DTO files.
3. Register the module in `AppModule`.
4. Implement validated query parsing.
5. Add Prisma queries for each searchable model.
6. Normalize and rank combined results.
7. Add Swagger documentation.
8. Add unit and e2e coverage.
9. Run build and tests.


## Execution Status

Implemented and verified on 2026-07-04.

Completed backend work:

* Added `SearchModule`, `SearchController`, `SearchService`, and search DTOs.
* Registered `SearchModule` in `AppModule`.
* Implemented `GET /api/search` with query text, optional type filter, limit, and offset.
* Searches workouts, workout exercises, meals, food items, goals, weight entries, and training plans.
* Normalizes results to `id`, `type`, `title`, `summary`, `date`, and `metadata`.
* Applies simple ranking and newest-first ordering inside the same rank.
* Added Swagger metadata for the search endpoint and response DTOs.
* Added unit coverage for search service behavior.
* Added e2e coverage for valid search, invalid query, invalid type, and no-match responses.
* Fixed lint issues in search query transformation and e2e supertest typing.

Verified commands:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

Note: `npm run test:e2e` currently passes with a `ts-jest` warning about hybrid module kind and `isolatedModules`; this is test configuration noise, not a search feature failure.

## Future Enhancements

* Add PostgreSQL full-text search indexes for larger datasets.
* Add search analytics for popular queries.
* Add highlighting for matched terms.
* Add date range filters.
* Add user ownership filtering when authentication is introduced.
