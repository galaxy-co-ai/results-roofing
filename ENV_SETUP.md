# Environment Variables Setup

Copy everything below the line into your `.env.local` file:

---

```env
# ===========================================
# DATABASE (Neon PostgreSQL)
# ===========================================
# Get these from: https://console.neon.tech → Your Project → Connection Details

# Pooled connection (for app queries)
DATABASE_URL=

# Direct/Unpooled connection (for migrations)
DATABASE_URL_UNPOOLED=


# ===========================================
# ADMIN DASHBOARD ACCESS
# ===========================================

# Password to access admin dashboard (via Ctrl+Shift+A)
ADMIN_PASSWORD=

# Session token for admin cookie validation (use a random string)
ADMIN_SESSION_TOKEN=
```

---

## After filling in values:

1. Save `.env.local`
2. Run `npx drizzle-kit push` to create database tables
3. Restart dev server: `npm run dev`
4. Press `Ctrl+Shift+A` on any page to access admin
