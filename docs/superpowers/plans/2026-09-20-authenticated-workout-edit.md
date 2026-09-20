# Authenticated Workout Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the workout-set edit request authenticate successfully by sending the signed access token returned from sign-in and validating the complete request flow.

**Architecture:** Keep the backend's existing HMAC-signed access-token implementation. The backend signs tokens with `AUTH_SECRET`, `AuthGuard` reads `Authorization: Bearer <accessToken>`, and `WorkoutsService.updateSet` continues enforcing workout ownership. The frontend stores the returned access token in memory or secure storage and attaches it to every protected workout edit request.

**Tech Stack:** NestJS, TypeScript, Prisma, Express, React Native/Expo frontend, HMAC-SHA256 access tokens.

**Spec:** The captured PATCH request currently has no `Authorization` header and must be changed to include the access token from `/api/auth/sign-in`.

## Global Constraints

- `AUTH_SECRET` exists only in the backend environment and is never bundled into frontend code.
- The frontend sends the access token, never `AUTH_SECRET`.
- Protected edit requests use `Authorization: Bearer <accessToken>`.
- A user may edit only workouts whose `userId` matches the authenticated token subject.
- Existing database migrations are not changed for this authentication fix.

### Task 1: Configure Backend Authentication

**Files:**
- Modify: `.env` and deployment environment variables
- Reference: `src/auth/auth.service.ts`
- Reference: `src/auth/auth.guard.ts`

**Interfaces:**
- Consumes: `AUTH_SECRET` from the backend environment.
- Produces: A sign-in response containing `accessToken`, and a guard that sets `request.user.id` from a valid Bearer token.

- [ ] **Step 1: Set the backend secret**

Generate one random value and set the same value in the backend `.env` and deployment environment:

```bash
openssl rand -hex 32
```

```env
AUTH_SECRET="<generated-value>"
```

- [ ] **Step 2: Restart the backend**

Restart the NestJS server after changing environment variables so the process loads the secret.

- [ ] **Step 3: Sign in again**

Do not reuse tokens created before the current token implementation. Call:

```http
POST /api/auth/sign-in
Content-Type: application/json

{"email":"<email>","password":"<password>"}
```

Save the returned `accessToken`.

### Task 2: Attach the Token in the Frontend API Client

**Files:**
- Modify: frontend API client or workout service where the PATCH request is created
- Modify: frontend auth/session state where `accessToken` is stored

**Interfaces:**
- Consumes: `accessToken` from the successful sign-in response.
- Produces: The exact header `Authorization: Bearer ${accessToken}` on the workout-set PATCH request.

- [ ] **Step 1: Store the sign-in token**

Store `response.accessToken` from `/api/auth/sign-in`. Do not store or import `AUTH_SECRET` in frontend code.

- [ ] **Step 2: Add the authorization header**

Change the request represented by the captured curl to include:

```ts
const response = await fetch(`${API_URL}/api/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`, {
  method: "PATCH",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ reps, weight }),
});
```

- [ ] **Step 3: Handle an expired or missing session**

If `accessToken` is missing, redirect to sign-in instead of sending the PATCH request. If the API returns `401`, clear the stored token and require sign-in again.

### Task 3: Verify the End-to-End Edit Flow

**Files:**
- Test: `src/auth/auth.service.spec.ts`
- Test: `src/auth/auth.guard.spec.ts`
- Test: `src/workouts/workouts.controller.spec.ts` or an e2e test covering the PATCH route

**Interfaces:**
- Consumes: A real signed token produced by `AuthService` and a PATCH request with a Bearer header.
- Produces: A successful workout update for the owner, `401` without a header, and `403` for a different user.

- [ ] **Step 1: Test missing credentials**

Assert that a PATCH request without `Authorization` returns `401` with `A valid access token is required`.

- [ ] **Step 2: Test valid credentials**

Sign in or create a signed test token, send `Authorization: Bearer <token>`, and assert the set updates when the token subject owns the workout.

- [ ] **Step 3: Test ownership**

Use a valid token for a different user and assert the update returns `403` without modifying the set.

- [ ] **Step 4: Run verification**

```bash
npm run build
npm test -- --runInBand
```

- [ ] **Step 5: Replay the corrected curl**

```bash
curl 'https://output-lemon-limb.ngrok-free.dev/api/workouts/<workout-id>/exercises/<exercise-id>/sets/<set-id>' \
  -X PATCH \
  -H 'Authorization: Bearer <accessToken>' \
  -H 'Content-Type: application/json' \
  -H 'ngrok-skip-browser-warning: true' \
  --data-raw '{"reps":60,"weight":78}'
```

Expected result: `200 OK` with the updated workout when the token belongs to the workout owner.

## Self-Review

The captured failure is covered by Task 2 because the request has no authorization header. Backend secret handling is covered by Task 1, and authentication, expiration, and ownership behavior are covered by Task 3. No JWT dependency or database migration is required for this fix.
