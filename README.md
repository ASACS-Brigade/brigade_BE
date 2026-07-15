# BGB Backend

Backend API for The 5th & 9th Surulere Companies of The Boys & Girls Brigade website.

## Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT authentication with refresh tokens
- Role-based admin access
- ImageKit image uploads
- Swagger API docs

## First Run

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm start:dev
```

API base URL: `http://localhost:4000/api/v1`

Swagger docs: `http://localhost:4000/docs`

The frontend should use:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Seed Notes

The seed creates starter article categories, articles, events, gallery albums, gallery images and public site settings. It does not create an admin unless these optional values are present in `.env`:

```bash
SEED_ADMIN_NAME="Site Admin"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="replace-with-a-strong-password"
```

## Modules

- Auth: login, refresh tokens, current user and first-admin bootstrap
- Users: admin-managed user accounts and roles
- Articles: magazine categories, featured stories, full article reads and publishing status
- Events: public events, reports, images and admin content management
- Gallery: categories, albums and images for enrolment, parade, outreach and other collections
- Contact: public contact intake plus admin inbox status tracking
- Registrations: public registration intake plus admin review status tracking
- Uploads: protected ImageKit image upload with upload records
- Settings: public site settings and protected admin updates

## First Admin Login

You can create the first admin in either of these ways after the database is migrated and empty:

1. Add the `SEED_ADMIN_*` variables above and run `pnpm prisma:seed`.
2. Call the bootstrap endpoint once:

```http
POST /api/v1/auth/bootstrap-admin
Content-Type: application/json

{
  "name": "Site Admin",
  "email": "admin@example.com",
  "password": "change-this-password"
}
```

The bootstrap endpoint creates a `SUPER_ADMIN`, returns access and refresh tokens, and locks itself once any user exists. After that, use:

- `POST /api/v1/auth/login` with `email` and `password`
- `POST /api/v1/auth/refresh` with `refreshToken`
- `GET /api/v1/auth/me` with a bearer access token
- `GET /api/v1/users` with a bearer access token
- `POST /api/v1/users` with a `SUPER_ADMIN` bearer access token
## Contact Email Delivery

Contact messages are saved in Postgres and emailed to `CONTACT_TO_EMAIL`. For this project, set:

```bash
CONTACT_TO_EMAIL=bbgb.asacs@gmail.com
RESEND_API_KEY=your_resend_api_key
CONTACT_FROM_EMAIL="BGB Website <contact@your-verified-domain.com>"
```

Resend requires a verified sending domain for normal delivery. Do not use `onboarding@resend.dev` when sending contact mail to `bbgb.asacs@gmail.com`; set `CONTACT_FROM_EMAIL` to an address on your verified Resend domain.

## ImageKit Uploads

Use ImageKit for hosted image uploads and delivery:

```bash
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
IMAGEKIT_UPLOAD_FOLDER=/bgb
```

The backend stores ImageKit `fileId` in the existing `UploadAsset.publicId` column for compatibility with the current schema.

## Neon Production Database

Use Neon with two connection strings:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DB?sslmode=require"
```

`DATABASE_URL` is for the running app. `DIRECT_URL` is for Prisma migrations.



