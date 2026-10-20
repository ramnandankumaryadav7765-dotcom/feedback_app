# Feedback Form

A small full-stack learning project. Visitors can submit feedback with their name, email, message, and optional Instagram or LinkedIn links. The Express server saves submissions in MongoDB Atlas and serves the form from the same web service.

## How the app works

```text
Browser (HTML, CSS, JavaScript)
        │  POST /api/feedback
        ▼
Express backend (Node.js)
        │  Mongoose model
        ▼
MongoDB Atlas: feedback_app.feedbacks
```

The browser sends the form data to the backend. The backend validates it and saves a document in MongoDB. The recent feedback list loads the latest public fields from the backend.

## Project structure

```text
server/
├── public/
│   ├── index.html       # Form and page structure
│   ├── styles.css       # Page styling
│   └── app.js           # Browser-side form and API requests
├── src/
│   ├── models/
│   │   └── Feedback.js  # MongoDB document schema
│   ├── db.js            # MongoDB connection
│   └── server.js        # Express server and API routes
├── .env.example         # Safe environment-variable template
├── .gitignore           # Excludes .env and node_modules
└── package.json         # Dependencies and scripts
```

## Run locally

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure MongoDB

Copy `server/.env.example` to `server/.env` the first time you set up the project. If `server/.env` already exists, keep it and edit it rather than copying over it.

Add your MongoDB Atlas connection string to `server/.env`:

```env
PORT=3000
MONGODB_URI="mongodb+srv://DATABASE_USERNAME:URL_ENCODED_PASSWORD@YOUR_CLUSTER_HOST/feedback_app?retryWrites=true&w=majority"
```

Replace the placeholders with your database user's credentials and Atlas cluster host. Keep `/feedback_app` in the URI. URL-encode special characters in the password (for example, `#` becomes `%23`).

In Atlas, the cluster must be running, the database user needs permission to read and write to `feedback_app`, and the IP address of the app must be on the project's Network Access list. For local development, allow your current IP address.

Never commit or share `server/.env`. It is excluded by `server/.gitignore`. The `.env.example` file contains placeholders only and is safe to share.

### 3. Start the server

From the `server` directory:

```bash
npm run dev
```

The terminal should report that MongoDB connected and the app is listening on port 3000. Open **http://localhost:3000** in a browser. Do not open `public/index.html` directly with a `file://` URL; API requests need the running server.

To start the server without file watching, use:

```bash
npm start
```

## MongoDB data

- **Database:** `feedback_app`
- **Collection:** `feedbacks`
- **Document:** one submitted feedback entry

The `Feedback` Mongoose model uses timestamps, so MongoDB documents include `createdAt` and `updatedAt`. Mongoose creates the collection on the first insert if it does not exist.

Fields saved for each entry:

| Field | Purpose |
|---|---|
| `name` | Visitor's name |
| `email` | Visitor's email; stored in MongoDB but omitted from public API responses |
| `message` | Feedback text |
| `instagram` | Optional Instagram URL |
| `linkedin` | Optional LinkedIn URL |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

Names, messages, and provided social links are displayed publicly in the recent feedback list. Email is stored in MongoDB but is not returned by the public list API.

## API routes

### `GET /api/feedback`

Returns up to the 100 most recent entries with public fields only: `id`, `name`, `message`, `instagram`, `linkedin`, and `createdAt`.

### `POST /api/feedback`

Accepts a JSON body with required `name`, `email`, and `message` fields, plus optional `instagram` and `linkedin` URLs.

Example request:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "message": "Thanks for the project!",
  "instagram": "https://instagram.com/alex",
  "linkedin": "https://linkedin.com/in/alex"
}
```

Successful submissions return HTTP `201`. Invalid input returns HTTP `400`.

## Deploy on Render

This project serves the frontend and backend from one Express web service.

1. Push the project to a GitHub repository. Keep `.env` out of the repository.
2. In Render, create a **Web Service** connected to that repository.
3. Configure the service:

   | Setting | Value |
   |---|---|
   | Root Directory | `server` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |

4. Add the `MONGODB_URI` environment variable in the Render dashboard. Its value is the same complete Atlas connection string used locally; do not include `MONGODB_URI=` in the value.
5. Add the Render service's outbound IP ranges to Atlas **Network Access** so the deployed backend can reach the cluster.
6. Deploy the service and open its public URL.

Render supplies `PORT` for the deployed service. Free instances may sleep after inactivity, so a first request after a quiet period can be delayed.

## Scripts

Run these commands from `server/`:

| Command | Description |
|---|---|
| `npm run dev` | Start the server with Node's watch mode |
| `npm start` | Start the server normally; used by Render |
