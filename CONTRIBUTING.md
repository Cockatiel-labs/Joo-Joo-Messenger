# Contributing to Cockatiel Messenger

First of all, thank you for your interest in contributing to Cockatiel Messenger.

Cockatiel is an open-source, privacy-first messaging platform built in public. Contributions of all sizes are welcome, whether it's reporting bugs, improving documentation, suggesting ideas, or submitting code changes.

## Ways to Contribute

You can help the project by:

- Reporting bugs
- Suggesting new features
- Improving documentation
- Reviewing code and pull requests
- Fixing issues
- Implementing new features

## Before You Start

Before opening a new issue, please:

- Search existing issues and discussions to avoid duplicates
- Check the project roadmap
- Make sure your proposal aligns with the project's goals

## Development Setup

### Requirements

- Bun
- Docker
- Docker Compose

### Clone the Repository

```bash
git clone https://github.com/Cockatiel-labs/Cockatiel-Messenger.git
cd Cockatiel-Messenger
```

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then update the values in `.env` as needed.

### Install Dependencies

```bash
bun install
```

### Start Infrastructure Services

```bash
docker compose -f ./infra/docker/docker-compose.yml up -d
```

### Run the Backend

```bash
bun --filter @cockatiel/api dev
```

### Run the Frontend

```bash
bun --filter @cockatiel/web dev
```

## Pull Requests

When submitting a pull request:

- Keep changes focused and reasonably scoped
- Link related issues whenever possible
- Update documentation when necessary
- Ensure the project builds successfully
- Respond to review feedback constructively

## Coding Guidelines

- Write clear and maintainable code
- Prefer readability over cleverness
- Follow existing project conventions
- Avoid introducing unnecessary dependencies

## Questions and Discussions

For questions, ideas, and general conversations, please use GitHub Discussions.

If you've identified a bug or have a specific task that requires action, please open an Issue instead.

If you're unsure where your topic belongs, start a Discussion first.

## Code of Conduct

Please be respectful and constructive when interacting with other contributors.

We aim to build an open, welcoming, and collaborative community.

Thank you for helping improve Cockatiel Messenger.
