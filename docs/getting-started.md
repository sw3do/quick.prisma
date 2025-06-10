# Getting Started with QuickPrisma

This guide will help you set up and start using QuickPrisma in your project.

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (local or cloud)
- Basic knowledge of TypeScript/JavaScript

## Installation

Choose your preferred package manager:

```bash
# npm
npm install quick-prisma

# yarn
yarn add quick-prisma

# pnpm
pnpm add quick-prisma

# bun
bun add quick-prisma
```

## Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** on your system
2. **Create a database**:
   ```bash
   createdb quickprisma
   ```
3. **Set up environment variable**:
   ```bash
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/quickprisma"
   ```

### Option 2: Supabase (Recommended for beginners)

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project**
3. **Get your connection string** from Settings > Database
4. **Set environment variable**:
   ```bash
   export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

### Option 3: Other Cloud Providers

#### Railway
```bash
export DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

#### Neon
```bash
export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb"
```

#### Render
```bash
export DATABASE_URL="postgresql://username:password@dpg-xxx-a.oregon-postgres.render.com/database_name"
```

## Project Setup

### 1. Initialize Prisma

If you don't have Prisma set up in your project:

```bash
npx prisma init
```

### 2. Configure Prisma Schema

Your `prisma/schema.prisma` should look like this:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model KeyValue {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("key_values")
}
```

### 3. Run Migrations

```bash
# Create and apply the initial migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/quickprisma"

# Or Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## Your First QuickPrisma App

Create a file called `app.js` or `app.ts`:

```typescript
import { QuickPrisma } from 'quick-prisma';

async function main() {
  // Initialize QuickPrisma
  const db = new QuickPrisma({
    connectionString: process.env.DATABASE_URL,
    autoConnect: true
  });

  try {
    // Store some data
    await db.set('user:1', {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      active: true
    });

    // Retrieve data
    const user = await db.get('user:1');
    console.log('User:', user);

    // Work with numbers
    await db.set('counter', 0);
    await db.add('counter', 10);
    await db.add('counter', 5);
    const counter = await db.get('counter');
    console.log('Counter:', counter); // 15

    // Work with arrays
    await db.push('todos', 'Buy groceries', 'Walk the dog');
    await db.push('todos', 'Finish project');
    const todos = await db.get('todos');
    console.log('Todos:', todos);

    // Remove from array
    await db.pull('todos', 'Walk the dog');
    const updatedTodos = await db.get('todos');
    console.log('Updated todos:', updatedTodos);

    // Check if key exists
    const hasUser = await db.has('user:1');
    console.log('Has user:1:', hasUser); // true

    // Get all keys
    const allKeys = await db.keys();
    console.log('All keys:', allKeys);

    // Get total count
    const totalRecords = await db.size();
    console.log('Total records:', totalRecords);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up connection
    await db.disconnect();
  }
}

main();
```

Run your app:

```bash
# With Node.js
node app.js

# With Bun
bun run app.ts

# With ts-node
npx ts-node app.ts
```

## Next Steps

Now that you have QuickPrisma working, explore these topics:

1. **[API Reference](./api-reference.md)** - Complete list of all methods
2. **[Advanced Usage](./advanced-usage.md)** - Complex queries and operations
3. **[Best Practices](./best-practices.md)** - Performance tips and patterns
4. **[Examples](./examples.md)** - Real-world use cases

## Common Issues

### Connection Errors

If you get connection errors:

1. **Check your DATABASE_URL** is correct
2. **Verify database is running** (for local PostgreSQL)
3. **Check firewall settings** (for cloud databases)
4. **Ensure database exists** and is accessible

### Migration Errors

If migrations fail:

1. **Check database permissions**
2. **Verify schema syntax** in `prisma/schema.prisma`
3. **Reset database** if needed: `npx prisma migrate reset`

### TypeScript Errors

If you get TypeScript errors:

1. **Install type definitions**: `npm install -D @types/node`
2. **Configure tsconfig.json** properly
3. **Generate Prisma client**: `npx prisma generate`

## Getting Help

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/sw3do/quick-prisma/issues)
- 💬 [Join Discussions](https://github.com/sw3do/quick-prisma/discussions) 