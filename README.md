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

*   [Node.js](https://nodejs.org/) (v18+ recommended).
*   `npm` (is installed with Node.js).

### 1. Installation

Clone the repository to your local machine:
```bash
git clone <your-repository-url>
cd <repository-folder-name>
```

### 2. Setup and Run the Backend (Server)

Open your **first terminal**.

```bash
# 1. Navigate to the server directory
cd server

# 2. Create a .env configuration file
#    Copy the content below into a new ./server/.env file
```

Contents for the **`.env`** file:
```env
# ./server/.env
PORT=3001
JWT_SECRET=a_very_strong_secret_key_for_testing
DATABASE_PATH=./database.sqlite
```

```bash
# 3. Install dependencies, initialize, and seed the database
npm install
npm run init-db
npm run seed-db

# 4. Run the server in development mode
npm run dev
```
The server will be running at `http://localhost:3001`. Keep this terminal open.

### 3. Setup and Run the Frontend (Client)

Open a **second terminal**.

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Run the client in development mode
npm run dev
```

### 4. All Set!

The application will be available at the URL provided by Vite (usually **`http://localhost:5173`**). Open this link in your browser.

The app uses a mock authentication for development, which will automatically create a test user and provide a session token.