# Luft Backend

Luft Backend is a Node.js and TypeScript service for tracking user investments and balances. It exposes REST endpoints for user authentication, registering transactions and retrieving consolidated investment data.

## Features
- Express server using OvernightJS with TypeScript
- PostgreSQL database managed via Drizzle ORM
- Redis cache and scheduled jobs that refresh user balances every five minutes
- Integrates with the Brapi API to fetch stock and cryptocurrency prices
- Unit and integration tests with Jest

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/)
- Docker (to run PostgreSQL and Redis with `docker-compose`)

### Installation
1. Install dependencies:
   ```bash
   yarn install
   ```
2. Start required services:
   ```bash
   docker-compose up -d db redis
   ```
3. Provide environment variables (see below) in a `.env` file or your shell.
4. Run database migrations:
   ```bash
   yarn db:migrate
   ```

### Running the App
- Development:
  ```bash
  yarn start:dev
  ```
- Production build:
  ```bash
  yarn start
  ```

### Environment Variables
| Variable | Description |
|----------|-------------|
| `PORT` | Port for the HTTP server |
| `BRAPI_API_URL` | Base URL for the Brapi API |
| `BRAPI_API_TOKEN` | Authentication token for Brapi |
| `BRAPI_SIMULTANEOUS_REQUEST_LIMIT` | Max simultaneous requests to Brapi |
| `POSTGRES_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET_KEY` | Secret key used to sign JWT tokens |

### Testing and Linting
- Run all tests:
  ```bash
  yarn test
  ```
- Lint the codebase:
  ```bash
  yarn lint
  ```

## Additional Commands
- Seed the database:
  ```bash
  yarn db:seed
  ```
- Automatically fix lint issues:
  ```bash
  yarn lint:fix
  ```

## License

MIT
