# Quickstart: Categories & Provider Profiles

## Prerequisites
- Completed Authentication & User Foundation feature.
- PostgreSQL database accessible.

## Setup
1. **Database**: Run `npx prisma migrate dev --name add_categories_profiles` to update the schema.
2. **Seeding**: (Optional) Add initial categories to the `categories` table.

## Verification
1. **Manage Categories**: Log in as Admin and `POST /categories`.
2. **Create Profile**: Log in as Provider and `PATCH /providers/profile`.
3. **Link Categories**: As Provider, `POST /providers/categories` with category IDs.
4. **Discover**: As Customer, `GET /providers?categoryId=...` to test filtering.
