# Contributing to Joo-joo Messenger

Thank you for your interest in contributing to Joo-joo Messenger.

This project is open source, privacy-focused, and community driven. Contributions of all sizes are welcome, including bug reports, documentation improvements, design feedback, testing, and code changes.

## Ways to Contribute

You can help by:

- Reporting bugs
- Suggesting features
- Improving documentation
- Reviewing pull requests
- Fixing issues
- Improving UX and accessibility
- Sharing feedback on architecture and product direction

## Where to Start

If you are new to the project, look for issues labeled:

- `good first issue`
- `help wanted`
- `documentation`

These are the easiest entry points for first-time contributors.

## Development Setup

### Requirements

- Bun
- Docker
- Docker Compose

### Clone the repository

```bash
git clone https://github.com/Cockatiel-labs/Joo-Joo-Messenger.git
cd Joo-joo-Messenger
```

### Install dependencies

```bash
bun install
```

### Configure environment variables

```bash
cp .env.example .env
```

Then update the values in `.env` for your local environment.

### Start infrastructure services

```bash
docker compose -f ./infra/docker/docker-compose.yml up -d
```

### Run the backend

```bash
bun run dev:api
```

### Run the frontend

```bash
bun run dev:web
```

## Code Style

This repository uses Biome for formatting and linting.

Before opening a pull request, run:

```bash
bun run format
bun run lint
```

## Pull Request Guidelines

Please:

- Open pull requests against the `develop` branch
- Keep changes small and focused
- Link the related issue when possible
- Update documentation if behavior changes
- Make sure the project still builds
- Respond to review feedback kindly and clearly

## Issue Guidelines

When opening an issue, include enough context to understand the problem or request.

For bugs, please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or logs if available

For feature requests, please explain:

- The problem being solved
- The proposed solution
- Any alternatives you considered

## Communication

Use GitHub Discussions for questions, general ideas, and conversations that do not require an issue.

If something is clearly a bug or requires action, open an issue instead.

## Thank You

Every contribution helps move the project forward.

Thanks for helping build Joo-joo Messenger.
