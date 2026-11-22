# Little World

Little World is a Human–Computer Interaction class project for children ages 8–12. It adapts the supplied Figma Make export into an interactive learning site. The Grown-ups corner lets verified guardians request products and services.

## Abraham Barasa's contribution

- **Frontend.** Organised the React, Vite, and Tailwind frontend around the Figma export and adapted the word and number activities for ages 8–12. Built the Products and Services flows, including guardian sign-up, email verification, request receipts, and controls to view, edit, and cancel requests. Checked keyboard navigation, focus restoration, and mobile layouts.
- **Backend.** Built the Node.js and Fastify API and connected it to Firebase Authentication and Firestore. Added catalog and request CRUD, enforced guardian ownership and admin permissions, and wrote integration tests using the Firebase emulators.
- **Project setup.** Separated the frontend and backend, pinned the toolchain, and set up GitHub Actions to check the frontend build and backend tests. Verified a product request and a service request in Cloud Firestore.

## Project layout

| Folder | Purpose |
| --- | --- |
| `frontend/` | React 19, Vite 8, and Tailwind CSS 4. Contains the Figma Make configuration, styles, and illustrations. |
| `frontend/src/components/` | Shared UI components, icons, and illustrations. |
| `frontend/src/activities/` | Interactive activities. |
| `frontend/src/auth/` | Firebase Web app configuration and guardian sign-in, sign-up, and email verification. |
| `frontend/src/requests/` | Shared Products and Services catalogs and request forms. |
| `backend/` | Node.js API, Firebase configuration, Firestore rules, and integration tests. See the [backend guide](backend/README.md). |

## Set up a fresh clone in VS Code

The local setup uses Firebase emulators and seeded demo data. Each teammate can run it in their own clone.

### 1. Install and check the tools

Install Git, VS Code, Node.js 24 LTS, and Java 21 or newer. Java runs the Firestore emulator. In PowerShell, install the pinned pnpm version and check your tools.

```powershell
npm.cmd install --global pnpm@10.34.3
git --version
node --version
java -version
pnpm.cmd --version
```

### 2. Clone the repository

Open PowerShell in the parent folder where you want to keep the project. Use the GitHub account that has access to the repository.

```powershell
git clone https://github.com/Bleah012/littleworld.git
Set-Location -LiteralPath '.\littleworld'
code .
```

If `code .` is unavailable, open VS Code and choose **File → Open Folder**, then select `littleworld`.

### 3. Install the frontend and backend dependencies

In VS Code, open **Terminal → New Terminal**. Run these commands from the `littleworld` folder, which contains both `frontend` and `backend`.

```powershell
pnpm.cmd --dir backend install --frozen-lockfile
pnpm.cmd --dir frontend install --frozen-lockfile
```

### 4. Start Firebase Auth and Firestore

In **Terminal 1**, from the `littleworld` folder, run the emulators and wait for **All emulators ready**. Keep the terminal open.

```powershell
pnpm.cmd --dir backend emulators
```

### 5. Seed the demo data and start the Node API

In **Terminal 2**, from the `littleworld` folder, run the following. The seed adds demo products, services, and accounts. The API listens on port 3001.

```powershell
pnpm.cmd --dir backend seed
if ($LASTEXITCODE -eq 0) { pnpm.cmd --dir backend dev }
```

Keep this terminal open. Rerun the seed after restarting the emulators to reload the demo data.

### 6. Start the React frontend

In **Terminal 3**, from the `littleworld` folder, run Vite and open [Little World](http://127.0.0.1:5174/).

```powershell
pnpm.cmd --dir frontend dev --host 127.0.0.1 --port 5174 --strictPort
```

If the catalog fails to load, use a spare terminal to check the API.

```powershell
Invoke-RestMethod 'http://127.0.0.1:3001/api/health'
Invoke-RestMethod 'http://127.0.0.1:3001/api/products'
Invoke-RestMethod 'http://127.0.0.1:3001/api/services'
```

## Try Products and Services

1. Open **Grown-ups corner** in the footer, answer the prompt, and choose **Products** or **Services**.
2. Choose **Request** on an item and sign in with the [guardian demo account](backend/README.md#demo-accounts). To try sign-up, use a synthetic address such as `guardian-team@example.test` and open the verification link printed in **Terminal 1**. Return to Little World and sign in.
3. For a product, choose a quantity and send the request. For a service, review its duration and send the request. The receipt shows a reference number.
4. Open **My requests** to see the saved request, change the quantity or service, or cancel it. The session lasts while the dialog is open.

## Run the same checks as GitHub Actions

From the `littleworld` folder, run the frontend checks. Stop the manually started Firebase emulators with **Ctrl+C** in **Terminal 1** before running the backend tests, because the test command starts its own emulators on the same ports.

```powershell
pnpm.cmd --dir frontend exec tsc --noEmit
pnpm.cmd --dir frontend build
pnpm.cmd --dir backend test
```

## Connect a Firebase cloud project

Use cloud mode for the live class demo.

1. In the [Firebase console](https://console.firebase.google.com/), register a Web app and enable **Email/Password** in **Authentication → Sign-in method**.
2. Copy `frontend/.env.example` to `frontend/.env.cloud.local` and fill it with the registered Web app's settings.
3. Set up Cloud Firestore in the same project and apply the rules in `backend/firestore.rules`. Start the API with the matching project ID and Application Default Credentials using the [cloud backend setup](backend/README.md#use-cloud-firebase-for-the-demo).
4. From the `littleworld` folder, run `pnpm.cmd --dir frontend dev --mode cloud --host 127.0.0.1 --port 5174 --strictPort`.

The Web app's configuration is for the browser. Keep server credentials outside the repository and out of Vite variables.

## Team workflow

1. Update your local `main` with `git switch main` and `git pull --ff-only origin main`.
2. Create a feature branch for your module, commit related changes, and include the lockfile if dependencies change.
3. Push your branch and open a pull request into `main`. Describe what changed and how you tested it.
4. Get a teammate review and check that both GitHub Actions jobs pass before merging.
