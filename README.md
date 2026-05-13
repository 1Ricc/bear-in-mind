# ESG Island Gamification

This is a web application designed to gamify ESG initiatives within a company. Users and teams contribute to environmental and social goals, and their collective progress is visualized as a growing isometric island.

## Key Features

*   **Progress Visualization:** Personal and team contributions are displayed as unique isometric islands that grow as points (saved kg of CO₂) are accumulated.
*   **Team Competition:** Users are organized into teams, allowing for the tracking of collective progress and fostering healthy competition.
*   **Activity Gamification:** Users can log the completion of various ESG activities (e.g., planting trees, recycling waste) and receive rewards.
*   **Responsive Design:** The interface is designed to display correctly on both desktop and mobile devices.

## Tech Stack

*   **Frontend:** Vue 3 (Composition API), Vite, Vue Router
*   **Backend:** Node.js, Express.js
*   **Database:** SQLite (via `better-sqlite3`)

## Quick Start

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   `npm` (bundled with Node.js)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <repository-folder-name>
```

### 2. Backend setup (Terminal 1)

```bash
cd server
```

Create a `server/.env` file with the following contents:

```env
PORT=3001
JWT_SECRET=a_very_strong_secret_key_for_testing
DATABASE_PATH=./database.sqlite
AZURE_CLIENT_ID=dev-placeholder
AZURE_TENANT_ID=dev-placeholder
AZURE_CLIENT_SECRET=dev-placeholder
REDIRECT_URI=http://localhost:3001/api/auth/callback
```

Then install, initialize and seed the database, and start the server:

```bash
npm install
npm run init-db
npm run seed-db
npm run dev
```

The server runs at `http://localhost:3001`. Keep this terminal open.

### 3. Frontend setup (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app

Visit **`http://localhost:5173`** in your browser.

On first load the app automatically signs in as a test user via the `/api/auth/dummy-login` endpoint — no manual login step required. The test user starts with seeded activity data so you can explore the island and stats views immediately.

> **Note:** The Azure AD / Microsoft 365 OAuth flow (`/api/auth/signin`) is only active in production with real credentials. The placeholder values in the `.env` above are sufficient for local development.