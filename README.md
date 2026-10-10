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

#### Seed Sample Game History

To preview stats and graphs with data, backfill completed games for your own local account, plus a set of fake players so the global median has other players to compare against. **Local only — never run against Neon.**

1. Log in locally once so your user exists in the `users` table:
   1. With the database running, start the development server (see [Run Development Server](#run-development-server)).
   1. Open [http://localhost:3000](http://localhost:3000), open the login overlay, and sign in with Google or Discord.
   1. Use the email of that account for `email` in the commands below. You can confirm it in the `users` table via `adminer`.

1. Seed completed games for the past `days` days, for you and `players` fake players. For a little over a year of history with 20 other players (enough to fill every timeframe, including ALL and YTD):

   ```bash
   docker compose exec -T db psql -U postgres -d freecelldb \
     -v email='you@example.com' -v days=400 -v players=20 < scripts/seed_dev_games.sql
   ```

   Use a smaller `days` (e.g. `days=60`) for a quicker, shorter history.

   **NOTE:** Today's deal is skipped so it stays playable, and roughly 20% of days are left empty to simulate missed days. Existing games are never overwritten. Times are random (2–12 minutes), trending faster over time.

   **NOTE:** The script also creates fake players (`seed-player-N@seed.invalid`, 20 by default) who complete about 70% of the same days. Each has their own typical pace of 3–9 minutes. Change the count with `players` (it defaults to 20 if omitted). Re-running adds games for existing fake players rather than creating duplicates.

1. Remove your seeded games (identified by their empty move list) and the fake players with all of their games:

   ```bash
   docker compose exec -T db psql -U postgres -d freecelldb \
     -v email='you@example.com' < scripts/unseed_dev_games.sql
   ```

   **NOTE:** Seeding does not touch the `streaks` table, so streak stats will not reflect the seeded games.

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