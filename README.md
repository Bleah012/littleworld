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
2. Choose an item, sign in with the guardian demo account listed in the backend setup, and send a request.
3. Open **My requests** to check the saved item, change its quantity, or cancel it. Sign-in lasts while the Products dialog is open. Requests stay in the running Firestore emulator.

## Team workflow

- Start each task on a feature branch from `main` and open a pull request for teammate review.
- Include how you verified the change. For frontend work, include the browser and the layout or interaction you checked.
- Commit the lockfile for the package whose dependencies change. Keep local environment files and credentials out of Git.
