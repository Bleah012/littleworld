# Little World backend

The Node.js API uses Fastify, Firebase Authentication, and Cloud Firestore. The class demo uses the local Firebase project `demo-littleworld` and synthetic data.

## Run locally in PowerShell

Use Node.js 24, pnpm 10.34.3, and Java 21 or newer. From the repository root, start the Auth and Firestore emulators in one terminal.

```powershell
Set-Location -LiteralPath '.\backend'
pnpm.cmd install --frozen-lockfile
pnpm.cmd emulators
```

From the repository root in a second terminal, seed the catalog and accounts, then start the API.

```powershell
Set-Location -LiteralPath '.\backend'
pnpm.cmd seed
pnpm.cmd dev
```

The API listens on `http://127.0.0.1:3001`. Try `Invoke-RestMethod 'http://127.0.0.1:3001/api/products'` for a public read. The emulator starts fresh each time, so rerun the seed after restarting it. Reseeding the sample catalog and role claims is safe while the emulator is running.

## API contract for Products and Services

| Resource | Read | Create | Update | Delete |
| --- | --- | --- | --- | --- |
| `/api/products` | List and detail are public | Admin | Admin | Admin |
| `/api/services` | List and detail are public | Admin | Admin | Admin |
| `/api/order-requests` | Own records for guardians, all active records for admins | Guardian or admin | Owner or admin | Owner or admin |
| `/api/service-requests` | Own records for guardians, all active records for admins | Guardian or admin | Owner or admin | Owner or admin |

Lists use `GET` and return a `products`, `services`, or `requests` array. Create uses `POST` on the collection URL. Detail reads, `PATCH`, and `DELETE` append the product or service ID or the request UUID to that URL. Successful deletion returns `204`. For requests, deletion cancels the request and preserves the ID so late retries cannot recreate it.

- Product fields are `id`, `name`, and `description`. Services also have `durationMinutes`. IDs are lowercase slugs and can be supplied during creation.
- Order requests take `requestId`, `productId`, and `quantity` from 1 to 10. Service requests take `requestId` and `serviceId`. For an edit, send only the item or quantity changes in the PATCH body.
- The frontend should generate one UUID with `crypto.randomUUID()` per submission and reuse it when retrying. A new submission returns `201` and a repeated submission by the same account with the same details returns `200`. Both return `{ requestId, status: "requested" }`. An unavailable item returns `404` and conflicting reuse returns `409`.
- Protected routes take a Firebase ID token in the `Authorization: Bearer <token>` header. Administrator access requires the signed `admin` custom claim. A self-registered email/password account gets guardian access after verifying its email. The API uses the verified account's UID for ownership checks. The request body only accepts the documented fields.

### Demo accounts

| Role | Email | Emulator password |
| --- | --- | --- |
| Guardian | guardian@example.test | LittleWorldGuardianDemo! |
| Admin | admin@example.test | LittleWorldAdminDemo! |

To try an authenticated request in PowerShell while both terminals are running, sign in to the local Auth emulator. Use these accounts only with the local demo project.

```powershell
$login = Invoke-RestMethod -Method Post -ContentType 'application/json' `
  -Uri 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key' `
  -Body (@{
    email = 'guardian@example.test'
    password = 'LittleWorldGuardianDemo!'
    returnSecureToken = $true
  } | ConvertTo-Json)

Invoke-RestMethod -Method Post -ContentType 'application/json' `
  -Uri 'http://127.0.0.1:3001/api/order-requests' `
  -Headers @{ Authorization = "Bearer $($login.idToken)" } `
  -Body (@{
    requestId = [guid]::NewGuid().ToString()
    productId = 'puzzle-book'
    quantity = 1
  } | ConvertTo-Json)
```

## Run the same backend test as CI

Stop the manual emulators with `Ctrl+C` to free ports 8080 and 9099. In the backend directory, run `pnpm.cmd test`. The command starts both emulators, runs Node's integration tests, and stops the emulators afterward.

## Use cloud Firebase for the demo

In a fresh PowerShell terminal in the `backend/` directory, set the same project ID as the registered Web app. The API uses [Application Default Credentials](https://firebase.google.com/docs/admin/setup#initialize_the_sdk). If you have a local service account key, keep it outside Git and set `GOOGLE_APPLICATION_CREDENTIALS` to its absolute path in this terminal.

```powershell
$env:LITTLE_WORLD_FIREBASE_PROJECT_ID = 'your-firebase-project-id'
pnpm.cmd dev
```

The demo seed script is emulator-only. Catalog writes in the cloud project require an administrator account with the signed `admin` claim.
