// prisma.config.ts
//
// This file is here for future extensibility (custom generators, etc.).
// It currently contains no active code.
//
// The real fixes for "npx prisma db push hangs forever" (especially with Supabase):
//   1. prisma/schema.prisma now declares both `url` and `directUrl`.
//   2. The root .env contains BOTH the pooled DATABASE_URL and the DIRECT_URL
//      (so the Prisma CLI can see the non-pooled connection needed for DDL).
//
// You do NOT need to edit this file.
// If this file ever causes the Prisma CLI to complain, you can safely delete it.
//
// For reference, the datasource in schema.prisma looks like:
//
// datasource db {
//   provider  = "postgresql"
//   url       = env("DATABASE_URL")
//   directUrl = env("DIRECT_URL")
// }
