# Little World

Little World is a class project based on the supplied Figma Make export. The original export is preserved in the first Git commit.

## Project layout

| Folder | Purpose |
| --- | --- |
| `frontend/` | React, Vite, and Tailwind site. Contains the Figma Make configuration, HTML, CSS, illustrations, and activities. |
| `frontend/src/components/` | Shared UI components, icons, and illustrations. |
| `frontend/src/activities/` | Interactive activities. |
| `frontend/src/hooks/` | Reusable React logic, including on-device progress. |
| `backend/` | Reserved for the Node.js API and Firebase integration. |

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

## Team workflow

- Start each task on a feature branch from `main` and open a pull request for teammate review.
- Include how you verified the change. For frontend work, include the browser and the layout or interaction you checked.
- Commit `frontend/pnpm-lock.yaml` with frontend dependency changes. Keep local environment files and credentials out of Git.
