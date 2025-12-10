# Full-Stack Application

A modern full-stack scaffold with a Node.js + Express backend and React + Vite frontend, both built with TypeScript.

## Project Structure

```
├── server/                 # Express backend
│   ├── src/
│   │   └── index.ts       # Express app entry point
│   ├── dist/              # Compiled JavaScript (generated)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   └── .env.example
│
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── main.tsx       # React entry point
│   │   ├── App.tsx        # Main component
│   │   └── App.css        # Styles
│   ├── dist/              # Build output (generated)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   └── .env.example
│
├── package.json           # Root workspace configuration
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 (or yarn)

## Getting Started

### 1. Install Dependencies

Install all dependencies in both server and client workspaces with a single command:

```bash
npm install
```

This uses npm workspaces to install dependencies for both the server and client simultaneously.

### 2. Set Up Environment Variables

Copy the example environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update the `.env` files if needed (defaults are configured for local development).

### 3. Run Development Mode

Start both the backend and frontend simultaneously:

```bash
npm run dev
```

This command uses `concurrently` to run:
- **Server**: TypeScript with hot-reload on `http://localhost:3001`
- **Client**: Vite dev server on `http://localhost:5173`

Once started, open your browser to `http://localhost:5173` and you should see the React app displaying the server's health check status.

## Available Scripts

### Root Level (runs in both workspaces)

```bash
npm run dev           # Start both server and client in development mode
npm run build         # Build both server and client for production
npm run lint          # Run ESLint in both workspaces
npm run format        # Format code with Prettier in both workspaces
npm run type-check    # Run TypeScript type checking in both workspaces
```

### Server Only

Navigate to the `server` directory or use workspace syntax:

```bash
npm run dev --workspace=server          # Start server dev mode
npm run build --workspace=server        # Build server
npm run start --workspace=server        # Start production server
npm run lint --workspace=server         # Lint server code
npm run format --workspace=server       # Format server code
npm run type-check --workspace=server   # Type check server
```

### Client Only

Navigate to the `client` directory or use workspace syntax:

```bash
npm run dev --workspace=client          # Start client dev mode
npm run build --workspace=client        # Build client
npm run preview --workspace=client      # Preview production build
npm run lint --workspace=client         # Lint client code
npm run format --workspace=client       # Format client code
npm run type-check --workspace=client   # Type check client
```

## Features

### Backend (Express)

- ✅ TypeScript support with strict mode
- ✅ CORS enabled for React development server
- ✅ Health check endpoint: `GET /health`
- ✅ API endpoint: `GET /api`
- ✅ Environment variable support (.env)
- ✅ Middleware for JSON and URL-encoded body parsing
- ✅ Error handling middleware
- ✅ ESLint and Prettier configuration

### Frontend (React + Vite)

- ✅ TypeScript support with strict mode
- ✅ React 18.2.0 with hooks
- ✅ Vite for fast development and optimized builds
- ✅ Health status checker component that fetches from backend
- ✅ CSS styling with responsive design
- ✅ Environment variable support (.env)
- ✅ ESLint and Prettier configuration

### Shared Tooling

- ✅ npm workspaces for monorepo management
- ✅ Unified TypeScript configuration standards
- ✅ Consistent ESLint rules across projects
- ✅ Consistent Prettier formatting
- ✅ Concurrent development server startup with `concurrently`
- ✅ .gitignore for both projects

## API Documentation

### Health Check Endpoint

**Request:**
```
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Welcome Endpoint

**Request:**
```
GET /api
```

**Response (200 OK):**
```json
{
  "message": "Welcome to the API",
  "version": "1.0.0"
}
```

## CORS Configuration

The backend is configured to accept requests from the React development server at `http://localhost:5173`. This can be modified in `server/src/index.ts` by changing the `clientUrl` variable or setting the `CLIENT_URL` environment variable.

## Building for Production

### Build both applications:

```bash
npm run build
```

This creates:
- `server/dist/` - Compiled Express server
- `client/dist/` - Optimized React static files

### Run production server:

```bash
npm run start --workspace=server
```

The server will serve on `http://localhost:3001`.

## Development Workflow

1. **Start development servers**: `npm run dev`
2. **Make changes** in either `server/src/` or `client/src/`
3. **Hot reload** is enabled for both applications
4. **Check types**: `npm run type-check`
5. **Run linter**: `npm run lint`
6. **Format code**: `npm run format`

## Troubleshooting

### Port Already in Use

If ports 3001 or 5173 are already in use:

- **Server**: Set `PORT` in `server/.env`
- **Client**: Set `VITE_PORT` in `vite.config.ts`

### Dependencies Not Installing

Clear npm cache and reinstall:

```bash
npm cache clean --force
rm -rf node_modules server/node_modules client/node_modules
npm install
```

### CORS Errors

Ensure the `CLIENT_URL` in `server/.env` matches your frontend URL (default: `http://localhost:5173`).

## Technology Stack

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Middleware**: cors, dotenv
- **Dev Tools**: tsx (TypeScript executor), ESLint, Prettier

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Dev Tools**: ESLint, Prettier

### DevOps
- **Monorepo**: npm workspaces
- **Task Runner**: npm scripts with concurrently

## License

MIT
