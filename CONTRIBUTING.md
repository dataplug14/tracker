# Contributing to VTC Tracker

Thank you for your interest in contributing to VTC Tracker! We welcome contributions from the community to help improve this project.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer)
- [Bun](https://bun.sh/) or npm

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/tracker.git
   cd tracker
   ```
3. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```
4. **Set up environment variables**:
   Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

   For development, `NEXT_PUBLIC_API_MODE=mock` is recommended.

5. **Start the development server**:
   ```bash
   bun dev
   # or
   npm run dev
   ```
   The app will be available at http://localhost:3000.

## Development Workflow

### Branching

- Create a new branch for each feature or bug fix:
  ```bash
  git checkout -b feature/my-new-feature
  # or
  git checkout -b fix/issue-123
  ```
- Keep branches small and focused.

### Commit Style

We follow the **Conventional Commits** specification:

- `feat: add new job creation form`
- `fix: resolve login redirect issue`
- `docs: update readme`
- `style: format code with prettier`
- `refactor: simplify auth logic`
- `test: add unit tests for utility functions`
- `chore: update dependencies`

### Pull Request Checklist

Before submitting a PR, please ensure:

- [ ] You have run `bun run lint` (or `npm run lint`) to check for code style issues.
- [ ] You have run `bun run typecheck` (or `npm run typecheck`) to verify TypeScript types.
- [ ] You have verified that the app builds with `bun run build`.
- [ ] You have added tests for any new functionality (if applicable).
- [ ] Your code follows the project's coding standards.

## Code Style

- We use **Prettier** for formatting. Please ensure your editor is configured to format on save, or run `npm run format`.
- We use **ESLint** for linting.
- We use **TypeScript** strictly (no explicit `any`).

## Reporting Issues

If you find a bug or have a feature request, please use the [Issue Tracker](https://github.com/your-org/tracker/issues) and select the appropriate template.
