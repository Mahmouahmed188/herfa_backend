# Quickstart: Authentication and User Foundation

## Prerequisites
- Node.js (v18+)
- PostgreSQL
- Prisma CLI installed (`npm install -g prisma`)

## Setup
1.  **Environment**: Create a `.env` file with `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`.
2.  **Database**: Run `npx prisma migrate dev --name init_auth` to create the user table.
3.  **Dependencies**: Run `npm install`.
4.  **Start**: Run `npm run start:dev`.

## Verification
1.  **Register**: Send a `POST` request to `/auth/register`.
2.  **Login**: Send a `POST` request to `/auth/login` and capture the tokens.
3.  **Profile**: Send a `GET` request to `/users/me` with the access token in the `Authorization` header.
