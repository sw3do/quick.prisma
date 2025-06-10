# QuickPrisma

A high-performance PostgreSQL database module with a quick.db-like API, built on top of Prisma ORM. QuickPrisma provides a simple key-value interface for complex database operations while maintaining the power and reliability of PostgreSQL.

## Features

- 🚀 **High Performance**: Built on Prisma ORM with PostgreSQL
- 🔑 **Key-Value Interface**: Simple API similar to quick.db
- 🎯 **TypeScript Support**: Full type safety and IntelliSense
- 🔄 **Auto-reconnection**: Automatic database connection management  
- 📊 **Advanced Operations**: Array manipulation, math operations, filtering
- 🛡️ **Production Ready**: Error handling and connection pooling
- 🌐 **Multiple Environments**: Local PostgreSQL and cloud providers (Supabase, etc.)

## Installation

```bash
npm install quick.prisma
# or
yarn add quick.prisma
# or
bun add quick.prisma
```

## Quick Start

### 1. Database Setup

#### Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create a database
createdb quickprisma

# Set environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/quickprisma"
```

#### Supabase (Cloud)
```bash
# Get your connection string from Supabase dashboard
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### Other Cloud Providers
```bash
# Railway
export DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# Neon
export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb"

# PlanetScale (with Prisma adapter)
export DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database-name?sslaccept=strict"
```

### 2. Initialize Prisma

```bash
# Initialize Prisma (if not already done)
npx prisma init

# Generate and run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 3. Basic Usage

```typescript
import { QuickPrisma } from 'quick.prisma';

const db = new QuickPrisma({
  connectionString: process.env.DATABASE_URL,
  autoConnect: true
});

// Basic operations
await db.set('user:1', { name: 'John', age: 30 });
const user = await db.get('user:1');

// Numeric operations
await db.set('counter', 0);
await db.add('counter', 5);
await db.subtract('counter', 2);

// Array operations
await db.push('fruits', 'apple', 'banana');
await db.pull('fruits', 'apple');

// Advanced queries
const allUsers = await db.filter((value, key) => key.startsWith('user:'));
const totalRecords = await db.size();
```

## API Reference

### Basic Operations

#### `set(key, value)`
Store a value with the given key.
```typescript
await db.set('user:1', { name: 'John', age: 30 });
await db.set('counter', 42);
await db.set('active', true);
```

#### `get(key)`
Retrieve a value by key.
```typescript
const user = await db.get('user:1');
const counter = await db.get('counter');
```

#### `delete(key)`
Delete a key-value pair.
```typescript
const deleted = await db.delete('user:1'); // returns boolean
```

#### `has(key)`
Check if a key exists.
```typescript
const exists = await db.has('user:1'); // returns boolean
```

### Numeric Operations

#### `add(key, value)`
Add a number to the stored value.
```typescript
await db.add('counter', 5); // counter += 5
```

#### `subtract(key, value)`
Subtract a number from the stored value.
```typescript
await db.subtract('counter', 3); // counter -= 3
```

### Array Operations

#### `push(key, ...values)`
Add values to an array.
```typescript
await db.push('fruits', 'apple', 'banana', 'orange');
```

#### `pull(key, value)`
Remove a value from an array.
```typescript
await db.pull('fruits', 'apple');
```

### Utility Operations

#### `all()`
Get all key-value pairs.
```typescript
const allData = await db.all();
```

#### `keys()`
Get all keys.
```typescript
const allKeys = await db.keys();
```

#### `values()`
Get all values.
```typescript
const allValues = await db.values();
```

#### `size()`
Get the total number of records.
```typescript
const count = await db.size();
```

#### `clear()`
Delete all records.
```typescript
const deletedCount = await db.clear();
```

### Advanced Operations

#### `filter(fn)`
Filter records based on a condition.
```typescript
const users = await db.filter((value, key) => key.startsWith('user:'));
const activeUsers = await db.filter((value) => value.active === true);
```

#### `map(fn)`
Transform all records.
```typescript
const userNames = await db.map((value, key) => value.name);
```

#### `find(fn)`
Find the first record matching a condition.
```typescript
const admin = await db.find((value) => value.role === 'admin');
```

## Advanced Usage

### Using AdvancedQuickPrisma

```typescript
import { AdvancedQuickPrisma } from 'quick.prisma';

const db = new AdvancedQuickPrisma();

// Advanced math operations
await db.math('score', 'multiply', 2);
await db.math('balance', 'divide', 3);

// Batch operations
await db.setMany([
  { key: 'user:1', value: { name: 'John' } },
  { key: 'user:2', value: { name: 'Jane' } }
]);

const users = await db.getMany(['user:1', 'user:2']);

// Key pattern matching
const userRecords = await db.startsWith('user:');
const configRecords = await db.endsWith(':config');

// Array utilities
const length = await db.arrayLength('fruits');
const hasApple = await db.arrayIncludes('fruits', 'apple');

// Object utilities
const keys = await db.objectKeys('user:1');
const hasName = await db.objectHasKey('user:1', 'name');

// Backup and restore
const backup = await db.backup();
await db.restore(backup);
```

### Connection Management

```typescript
const db = new QuickPrisma({
  connectionString: process.env.DATABASE_URL,
  autoConnect: false // Manual connection control
});

// Manual connection
await db.connect();

// Your operations here...

// Clean disconnect
await db.disconnect();
```

## Environment Setup

### Local Development

Create a `.env` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/quickprisma"
```

### Production (Supabase)

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Docker Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quickprisma
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Migration Guide

### From quick.db

```typescript
// quick.db
const db = require('quick.db');
await db.set('key', 'value');
const value = await db.get('key');

// QuickPrisma
import { QuickPrisma } from 'quick.prisma';
const db = new QuickPrisma();
await db.set('key', 'value');
const value = await db.get('key');
```

The API is nearly identical, making migration seamless!

## Performance Tips

1. **Use batch operations** for multiple records:
   ```typescript
   await db.setMany(records); // Better than multiple db.set()
   ```

2. **Enable connection pooling** in production:
   ```typescript
   const db = new QuickPrisma({
     connectionString: `${DATABASE_URL}?connection_limit=10`
   });
   ```

3. **Use filtering** instead of getting all records:
   ```typescript
   const users = await db.filter(v => v.active); // Better than db.all()
   ```

## Error Handling

```typescript
try {
  await db.set('key', 'value');
} catch (error) {
  if (error.code === 'P2002') {
    console.log('Unique constraint violation');
  } else {
    console.error('Database error:', error);
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/sw3do/quick.prisma#readme)
- 🐛 [Issue Tracker](https://github.com/sw3do/quick.prisma/issues)
- 💬 [Discussions](https://github.com/sw3do/quick.prisma/discussions)

## Acknowledgments

- Built with [Prisma ORM](https://prisma.io)
- Inspired by [quick.db](https://github.com/plexidev/quick.db)
- TypeScript support throughout 