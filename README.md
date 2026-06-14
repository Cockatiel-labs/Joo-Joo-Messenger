# Cockatiel Messenger

![GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue)
![Status](https://img.shields.io/badge/status-active_development-orange)

Privacy-first open source messenger built with Next.js and TypeScript.

No ads. No tracking. No data harvesting.

Cockatiel was created for people who believe communication should be simple, respectful, and transparent.

Built in public. Shaped by the community.

> Communication should serve people, not platforms.

## Current Status

⚠️ Cockatiel Messenger is currently under active development.

- Rapid changes are expected.
- Features may change without notice.
- Not ready for production use.

## Features

- [x] Open source
- [ ] Self-hostable
- [ ] Modern messaging experience
- [ ] Real-time communication
- [ ] End-to-end encryption (planned)

## Mission

To build a messaging platform where privacy comes first, communities matter, and users remain in control.

## Core Values

### Privacy by Design

Privacy is a fundamental expectation.

Cockatiel is being designed with privacy in mind from the very beginning, not added later as an afterthought.

### People Before Platforms

Technology should serve people.

The goal of Cockatiel is to create a communication platform that respects its users rather than exploiting them.

### Freedom with Responsibility

Healthy communities require both freedom and respect.

Cockatiel aims to provide an environment where people can communicate openly while maintaining a welcoming and responsible space for everyone.

## Technology Stack

### Backend

- Bun
- Elysia
- WebSockets
- PostgreSQL
- Drizzle ORM
- Redis
- Nginx

### Frontend

- Next.js
- React
- TanStack Query
- Zustand
- Tailwind CSS
- shadcn/ui

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions

## Getting Started

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
bun run dev:api
```

### Run the Frontend

```bash
bun run dev:web
```

## Documentation

Additional documentation can be found in the `/docs` directory.

## Contributing

Contributions, ideas, and feedback are welcome.

Please read `CONTRIBUTING.md` before opening a pull request.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

See the LICENSE file for details.
