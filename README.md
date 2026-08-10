# AlphoDrafts Client Web Application

## Domains

| Environment | URL                               |
| ----------- | --------------------------------- |
| local       | <http://localhost:3000>           |
| development | <https://dev.alphadrafts.com>     |
| staging     | <https://staging.alphadrafts.com> |
| production  | <https://www.alphadrafts.com>     |

## Getting Started

To install dependencies and run the project, run the following commands:

```bash
yarn install

yarn dev
```

To view the project, go to `http://localhost:3000` in your browser.

## Running Without a Backend (Mock Mode)

To preview the full app — including the dashboard, projects, settings, and
editor — without a backend, follow the guide in [MOCK_MODE.md](./MOCK_MODE.md).
It provides a mock user and sample data via a local `.env.local` flag
(`NEXT_PUBLIC_MOCK_AUTH=true`). The flag is gitignored and compiled out of
production builds.

## Commit Message Format

```bash
<type>[optional scope]: <description>
```

The type must be one of [build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test].

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
