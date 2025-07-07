# Freecell-React Setup Guide

A web Freecell game built with Phasor, Next.js, and postgreSQL.

## Prerequisites

- Node.js
- Docker
- Docker Compose

## Development Guide

### Local Development

1. Navigate to your project directory and install the necessary dependencies:

   ```bash
   npm install
   ```

1. Start the development server to see your project in action:

   ```bash
   npm run dev
   ```

1. Open your browser at the following address to view:

   [http://localhost:3000](http://localhost:3000)

### Local Testing with Database

1. Ensure `target:dev` in the file `docker-compose.yml`.

1. Build Docker image

   ```bash
   docker compose build
   ```

1. Run Docker image

   ```bash
   docker compose up
   ```

1. Stop and remove containers. Optional flags `--rmi all --volumes` to cleanup images and volumes.

   ```bash
   docker compose down
   ```

1. Open your browser and open:

   [http://localhost:3000](http://localhost:3000)

### Running the Linter

Run the auto fix linter after following [Local Development](#local-development) steps:

```bash
npm run lint:fix
```

Make sure to fix any remaining issues manually if they cannot be auto-fixed.

### Deployment

The project is currently deployed with Vercel. Simply update branch `main` and the rest is handled.