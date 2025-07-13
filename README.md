# Freecell-React Setup Guide

A web Freecell game built with Phasor, Next.js, and postgreSQL.

## Prerequisites

- Node.js
- Docker
- Docker Compose

## Development Guide

### Local Development

1. Navigate to your project directory and install dependencies:

   ```bash
   npm install
   ```

1. Start the development server:

   ```bash
   npm run dev
   ```

1. Open your browser at the following address to view:

   [http://localhost:3000](http://localhost:3000)

### Local Testing with Database

1. Build Docker image

   ```bash
   docker compose build
   ```

1. Run Docker image

   ```bash
   docker compose up
   ```

   **NOTE:** Database initialization only runs the first time the Postgres data volume is initialized.
   If the volume already exists, the script won’t re-run. Run the SQL manually using `adminer`.

1. Stop and remove containers. Optional flags `--rmi all --volumes` to cleanup images and volumes.

   ```bash
   docker compose down
   ```

### Running the Linter

Run the auto fix linter after following [Local Development](#local-development) steps:

```bash
npm run lint:fix
```

Make sure to fix any remaining issues manually if they cannot be auto-fixed.

### Deployment

The project is currently deployed with Vercel. Simply update branch `main` and the rest is handled.