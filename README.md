# Freecell-React Setup Guide

A web Freecell game built with Phasor, Next.js, and postgreSQL.

## Prerequisites

- Node.js
- Docker
- Docker Compose

## Development Guide

### Local Testing

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

1. **View Your Project**

   Open your browser and open:

   [http://localhost:3000](http://localhost:3000)

### Running the Linter

To ensure code consistency and catch potential issues, run the linter:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

Make sure to fix any remaining issues manually if they cannot be auto-fixed.

### Deployment

The project is currently deployed with Vercel. Simply update branch `main` and the rest is handled.