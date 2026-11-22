# Little World

Little World is a class project based on the supplied Figma Make export. The original export is preserved in the first Git commit.

## Project layout

| Folder | Purpose |
| --- | --- |
| `frontend/` | React, Vite, and Tailwind site. Contains the Figma Make configuration, HTML, CSS, illustrations, and activities. |
| `frontend/src/components/` | Shared UI components, icons, and illustrations. |
| `frontend/src/activities/` | Interactive activities. |
| `frontend/src/hooks/` | Reusable React logic, including on-device progress. |
| `backend/` | Node.js API, Firebase emulators, and integration tests. See [backend setup](backend/README.md). |

## Run in VS Code

1. Install Git, Node.js 24 LTS, and pnpm 10.34.3. To install the pinned pnpm version with npm, run `npm install --global pnpm@10.34.3`.
2. Open the `littleworld` project folder in VS Code with **File → Open Folder**.
3. Open **Terminal → New Terminal**. Verify the tools with `node --version`, `git --version`, and `pnpm --version`.
4. Run the commands below from the repository root and open `http://127.0.0.1:5174/`.

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5174
```

To verify the production build, run `pnpm build` from `frontend/`. If Windows PowerShell blocks the `pnpm.ps1` launcher, use `pnpm.cmd` in the same commands or switch the VS Code terminal profile to Command Prompt.

## Try the Products flow

Start the Firebase emulators and Node API using the [backend setup](backend/README.md), then start the frontend with the command above. If the API was already running before updating, restart it to load the guardian session route.

1. Open **Grown-ups corner** in the footer and choose **Products**.
2. Choose an item and sign in with the guardian demo account listed in the backend setup. To test sign-up, choose **Create guardian account**, use a synthetic email, and open the verification link printed in the Auth emulator terminal. Return to sign-in and send a request.
3. Open **My requests** to check the saved item, change its quantity, or cancel it. Sign-in lasts while the Products dialog is open. Requests stay in the running Firestore emulator.

## Connect a Firebase cloud project

Local development and CI use the emulators by default. To connect a cloud project for the class demo:

1. In the [Firebase console](https://console.firebase.google.com/), register a Web app and enable **Email/Password** in **Authentication → Sign-in method**.
2. Copy `frontend/.env.example` to `frontend/.env.cloud.local` and fill it with the registered Web app's settings.
3. Set up Cloud Firestore in the same project and apply the rules in `backend/firestore.rules`. Start the API with the matching project ID and Application Default Credentials as described in the [backend setup](backend/README.md).
4. From `frontend/`, run `pnpm.cmd dev --mode cloud --host 127.0.0.1 --port 5174` to use those settings.

The Web app's configuration is for the browser. Keep server credentials outside the repository and out of Vite variables.

## Team workflow

- Start each task on a feature branch from `main` and open a pull request for teammate review.
- Include how you verified the change. For frontend work, include the browser and the layout or interaction you checked.
- Commit the lockfile for the package whose dependencies change. Keep local environment files and credentials out of Git.
