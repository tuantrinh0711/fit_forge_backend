# Add Exercise Feature Plan

## Objective

Add a mobile workout exercise feature that lets users search for an exercise, select it, optionally add notes, save it to an existing workout, and immediately see it on the workout details screen.

## User Value

Users should be able to build a workout from familiar exercises without manually entering exercise names each time. The flow should be quick, searchable, accessible, and resilient to validation or network failures.

## Proposed API

### Add Exercise To Workout

`POST /api/workouts/{id}/exercises`

Path parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | ID of the workout that will receive the exercise. |

Request body:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `exerciseId` | string | Yes | Stable exercise catalog identifier. |
| `name` | string | Yes | Display name, maximum 120 characters. |
| `notes` | string | No | Optional setup or technique notes, maximum 500 characters. |

Example:

```http
POST /api/workouts/7cdb53c8-0bd0-4d48-a265-6a45a9aad35c/exercises
Content-Type: application/json

{
  "exerciseId": "barbell-bench-press",
  "name": "Barbell Bench Press",
  "notes": "Use a controlled tempo."
}
```

Expected response: the updated workout detail containing the newly added exercise.

### Refresh Workout Details

`GET /api/workouts/{id}`

The workout details screen should reload this endpoint after the add-exercise form sheet closes so the persisted exercise appears immediately.

## Frontend Design

Use the existing Expo Router workout stack with:

| File | Purpose |
| --- | --- |
| `app/workouts/[id].tsx` | Display workout details and open the add-exercise flow. |
| `app/workouts/[id]/add-exercise.tsx` | Search, select, validate, and submit an exercise. |
| `app/_layout.tsx` | Present the add-exercise route as a native form sheet. |
| `src/api/workouts.ts` | Call the add-exercise and workout-detail endpoints. |
| `src/data/exercise-catalog.ts` | Provide the initial searchable exercise catalog. |
| `src/types/workouts.ts` | Define exercise search results, DTOs, and workout response types. |
| `components/workouts/exercise-card.tsx` | Render persisted exercises on workout details. |

The route should be registered as:

```tsx
<Stack.Screen
  name="workouts/[id]/add-exercise"
  options={{
    presentation: 'formSheet',
    title: 'Add Exercise',
    sheetGrabberVisible: true,
    sheetAllowedDetents: [0.6, 1],
  }}
/>
```

## Exercise Search Scope

The current OpenAPI contract does not provide an exercise search endpoint. The initial version should use a typed local catalog and filter these fields case-insensitively:

| Field | Example |
| --- | --- |
| `name` | `Barbell Bench Press` |
| `category` | `Strength` |
| `primaryMuscles` | `Chest`, `Triceps`, `Shoulders` |

Trim the query and return all catalog exercises when the search field is empty. Display a clear empty state when no exercises match.

## Interaction Flow

1. User opens an existing workout.
2. User taps **Add Exercise**.
3. Expo Router presents the exercise search form sheet.
4. User searches by exercise name, category, or primary muscle.
5. User selects one result and optionally enters notes.
6. User confirms the selected exercise.
7. The app posts the exercise to the workout API.
8. On success, the app triggers iOS success haptics and closes the sheet.
9. The workout details screen regains focus, reloads the workout, and renders the new exercise.

## State And Accessibility

The add-exercise screen should manage:

| State | Behavior |
| --- | --- |
| Search query | Filters the local catalog as the user types. |
| Selected exercise | Visually marks the row and exposes checked radio state to assistive technology. |
| Notes | Supports multiline input and displays a 500-character counter. |
| Submitting | Disables confirmation and prevents duplicate requests. |
| API error | Displays an inline, selectable error while retaining the user's selection and notes. |

Keep result rows tappable while the software keyboard is open. Add accessible labels to search, notes, exercise choices, and confirmation controls.

## Validation And Errors

Do not submit when:

* The workout ID is missing.
* No exercise is selected.
* Notes exceed 500 characters.
* A request is already in progress.

Keep the form sheet open and show an inline error when:

* The API cannot be reached.
* The request times out.
* The API returns a non-success response.
* The response is not valid JSON.

Clear stale submission errors when the user selects a different exercise. Only close the sheet after the API confirms success.

## Testing Plan

Add unit tests for exercise filtering and validation:

* Returns all catalog entries for an empty query.
* Searches by partial exercise name.
* Searches by category.
* Searches by primary muscle.
* Returns an empty array when no result matches.
* Rejects submission without a selected exercise.
* Enforces the 500-character notes limit.

Add component or end-to-end coverage for the complete flow:

* Tapping **Add Exercise** opens the form sheet.
* Selecting a result updates the selected state.
* Confirmation sends the expected API payload once.
* API failure keeps the form open and displays the error.
* Successful submission closes the sheet.
* Returning to workout details reloads and displays the exercise.

Run before PR:

```bash
npm run lint
npx tsc --noEmit
```

Manually verify the Android, iOS, and web bundles through Expo Go or the Expo development server.

## Implementation Steps

1. Add the add-exercise user story to `User Story.md`.
2. Define `AddExerciseDto`, `ExerciseSearchResult`, and workout exercise response types.
3. Add a typed local exercise catalog.
4. Add the API client method for `POST /api/workouts/{id}/exercises`.
5. Register the add-exercise form-sheet route in the root stack.
6. Add the **Add Exercise** action to workout details.
7. Implement local search, empty results, selection, notes, and validation.
8. Submit the selected exercise and handle loading and API errors.
9. Reload workout details when the screen regains focus.
10. Add automated coverage and run static and runtime verification.

## Execution Status

Implemented and verified on 2026-07-12.

Completed frontend work:

* Added the add-exercise form-sheet route and workout details action.
* Added a local typed catalog with name, category, and muscle search.
* Added selected exercise and optional notes input states.
* Implemented `POST /api/workouts/{id}/exercises` through the shared API client.
* Added validation, request timeout handling, API errors, and duplicate-submit prevention.
* Added iOS success haptics.
* Reloads workout details on focus so the new exercise appears after submission.
* Added keyboard-safe result tapping and accessible selection state.

Verified commands:

```bash
npm run lint
npx tsc --noEmit
```

Android and web Metro bundles also compile successfully. Automated unit and end-to-end tests are still recommended because this project currently has no test script or test framework configured.

## Future Enhancements

* Add `GET /api/exercises?q=` so the catalog can be managed by the backend.
* Add pagination and category or muscle filters for a larger catalog.
* Prevent or clearly mark exercises already present in the workout.
* Add recent and favorite exercise sections.
* Cache server-backed exercise results for offline use.
* Add optimistic updates with rollback after the API contract is stable.
