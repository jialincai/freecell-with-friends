# Freecell-React Setup Guide

A web Freecell game built with Phasor, Next.js, and PostgreSQL.

## Prerequisites

- Node.js
- Docker
- Docker Compose
- psql

## Local Development Guide

### Setting Up Environment Variables

1. Create a `.env.local` file in the root of the project. Populate the following keys with your own secret values:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

NEXT_AUTH_URL=http://localhost:3000
AUTH_SECRET=

DATABASE_URL=postgres://postgres:insert_password_here@localhost:5432/freecelldb
```

1. Create a `.env` file in the root of the project. Populate the following keys with your own secret values:

```
POSTGRES_PASSWORD=insert_same_password_matching above
```

### Setting Up Local Database

#### Fetch File to Seed Daily Deals

   1. A CSV file containing the shuffled seeds is available on Google Drive.

   1. Download the file and place it in the `db-init/` directory of the project.

   1. Make sure the filename matches the one referenced in `db-init/init.sql` (used to populate the deals table).

   1. If the filename differs, update the `COPY FROM` line in `db-init/init.sql` to reflect the new filename.

#### Create Postgres Container

1. Build Docker image

   ```bash
   docker compose build
   ```

1. Run Docker image

   ```bash
   docker compose up
   ```

1. You can access the `adminer` database GUI at [http://localhost:8080](http://localhost:8080).

   **NOTE:** Database initialization only runs the first time the Postgres data volume is initialized.
   If the volume already exists, the script won’t re-run. Run the SQL manually using `adminer`.

1. Stop and remove containers.

   ```bash
   docker compose down
   ```

   **NOTE:** Optional flags `--rmi all --volumes` to cleanup images and volumes.

### Run Development Server

1. Navigate to your project directory and install dependencies:

   ```bash
   npm install
   ```

1. Start the development server:

   ```bash
   npm run dev
   ```

1. View the project at [http://localhost:3000](http://localhost:3000).

## Running the Linter

1. Before pushing any code to remote, run the linter.

   ```bash
   npm run lint:fix
   ```

   **NOTE:** Formatting issues are fixed automatically, but extra attention may be needed to resolve remaining issues.

1. Upon issue completion, scan and resolve all build errors.

   ```bash
   npm run build
   ```

## Deployment

### Client

The project is currently deployed with Vercel. Simply update branch `main` and the rest is handled.

If Vercel deployment fails in a branch, DO NOT MERGE THE FAILED BRANCH INTO MAIN.

### Database Setup

This project utilises Neon as the PosgreSQL data provider.

1. Run the contents of `db-init/init.sql` in Neon's SQL editor.

   **IMPORTANT:** Do NOT run the command that is commented.

1.  Start a `psql` connection in your terminal with the connection address specified on the Neon dashboard.

1. Enter the following command to prepopulate the `deals` table. Fill in the CSV file path appropriately.

   ```
   \copy deals FROM 'absolute_path_to_freecell_deals_shuffled_XXXXXXXX.csv' DELIMITER ',' CSV HEADER
   ```

   You should see the output `COPY 999992`.