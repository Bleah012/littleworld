# Little World

Little World is a class project based on the supplied Figma Make export. The website uses React, Vite, and Tailwind CSS. The original export is preserved in the first Git commit.

## Run in VS Code

1. Install Git, Node.js 24 LTS, and pnpm 10.34.3. To install the pinned pnpm version with npm, run `npm install --global pnpm@10.34.3`.
2. Clone the team repository and open the project folder in VS Code with **File → Open Folder**.
3. Open **Terminal → New Terminal**. Verify the tools with `node --version`, `git --version`, and `pnpm --version`.
4. Run the commands below and open the local URL printed by Vite. The export defaults to `http://127.0.0.1:8443/`.

```sh
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1
```

To verify the production build, run `pnpm build` from the project folder. If Windows PowerShell blocks the `pnpm.ps1` launcher, use `pnpm.cmd` in the same commands or switch the VS Code terminal profile to Command Prompt.

## Team workflow

- Start each task on a feature branch from `main` and open a pull request for teammate review.
- Include how you verified the change. For frontend work, include the browser and the layout or interaction you checked.
- Commit changes to `pnpm-lock.yaml` with dependency changes. Keep local environment files and credentials out of Git.
