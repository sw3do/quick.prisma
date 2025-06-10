# API Reference

Complete reference for all QuickPrisma methods and their usage.

## Constructor

### `new QuickPrisma(options?)`

Creates a new QuickPrisma instance.

**Parameters:**
- `options` (optional): Configuration object
  - `connectionString?: string` - Database connection string (defaults to `process.env.DATABASE_URL`)
  - `autoConnect?: boolean` - Whether to connect automatically (default: `true`)

**Example:**
```typescript
const db = new QuickPrisma({
  connectionString: 'postgresql://user:pass@localhost:5432/db',
  autoConnect: true
});
```

## Connection Management

### `connect()`

Manually connect to the database.

**Returns:** `Promise<void>`

**Example:**
```typescript
await db.connect();
```

### `disconnect()`

Disconnect from the database.

**Returns:** `Promise<void>`

**Example:**
```typescript
await db.disconnect();
```

## Basic Operations

### `set(key, value)`

Store a value with the given key.

**Parameters:**
- `key: string` - The key to store the value under
- `value: DatabaseValue` - The value to store (string, number, boolean, object, array, null)

**Returns:** `Promise<DatabaseValue>` - The stored value

**Example:**
```typescript
await db.set('user:1', { name: 'John', age: 30 });
await db.set('counter', 42);
await db.set('active', true);
await db.set('tags', ['javascript', 'typescript']);
```

### `get(key)`

Retrieve a value by key.

**Parameters:**
- `key: string` - The key to retrieve

**Returns:** `Promise<DatabaseValue | null>` - The stored value or null if not found

**Example:**
```typescript
const user = await db.get('user:1');
const counter = await db.get('counter');
const nonExistent = await db.get('missing'); // null
```

### `delete(key)`

Delete a key-value pair.

**Parameters:**
- `key: string` - The key to delete

**Returns:** `Promise<boolean>` - True if deleted, false if key didn't exist

**Example:**
```typescript
const deleted = await db.delete('user:1');
if (deleted) {
  console.log('User deleted successfully');
}
```

### `has(key)`

Check if a key exists.

**Parameters:**
- `key: string` - The key to check

**Returns:** `Promise<boolean>` - True if key exists, false otherwise

**Example:**
```typescript
const exists = await db.has('user:1');
if (exists) {
  console.log('User exists');
}
```

## Numeric Operations

### `add(key, value)`

Add a number to the stored value. If the key doesn't exist or isn't a number, treats it as 0.

**Parameters:**
- `key: string` - The key to modify
- `value: number` - The number to add

**Returns:** `Promise<number>` - The new value after addition

**Example:**
```typescript
await db.set('counter', 10);
await db.add('counter', 5); // counter is now 15
await db.add('newCounter', 10); // creates newCounter with value 10
```

### `subtract(key, value)`

Subtract a number from the stored value. If the key doesn't exist or isn't a number, treats it as 0.

**Parameters:**
- `key: string` - The key to modify
- `value: number` - The number to subtract

**Returns:** `Promise<number>` - The new value after subtraction

**Example:**
```typescript
await db.set('counter', 10);
await db.subtract('counter', 3); // counter is now 7
```

## Array Operations

### `push(key, ...values)`

Add values to an array. If the key doesn't exist or isn't an array, creates a new array.

**Parameters:**
- `key: string` - The key to modify
- `...values: DatabaseValue[]` - Values to add to the array

**Returns:** `Promise<DatabaseValue[]>` - The updated array

**Example:**
```typescript
await db.push('fruits', 'apple', 'banana');
await db.push('fruits', 'orange'); // ['apple', 'banana', 'orange']
await db.push('newList', 'first'); // creates new array ['first']
```

### `pull(key, value)`

Remove a value from an array. Uses deep comparison for objects.

**Parameters:**
- `key: string` - The key to modify
- `value: DatabaseValue` - The value to remove

**Returns:** `Promise<DatabaseValue[]>` - The updated array

**Example:**
```typescript
await db.set('fruits', ['apple', 'banana', 'apple']);
await db.pull('fruits', 'apple'); // ['banana'] (removes all instances)

await db.set('users', [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]);
await db.pull('users', { id: 1, name: 'John' }); // [{ id: 2, name: 'Jane' }]
```

## Utility Operations

### `all()`

Get all key-value pairs in the database.

**Returns:** `Promise<DatabaseEntry[]>` - Array of all entries

**Example:**
```typescript
const allData = await db.all();
// [
//   { key: 'user:1', value: { name: 'John' }, createdAt: Date, updatedAt: Date },
//   { key: 'counter', value: 42, createdAt: Date, updatedAt: Date }
// ]
```

### `keys()`

Get all keys in the database.

**Returns:** `Promise<string[]>` - Array of all keys

**Example:**
```typescript
const allKeys = await db.keys();
// ['user:1', 'counter', 'fruits']
```

### `values()`

Get all values in the database.

**Returns:** `Promise<DatabaseValue[]>` - Array of all values

**Example:**
```typescript
const allValues = await db.values();
// [{ name: 'John' }, 42, ['apple', 'banana']]
```

### `size()`

Get the total number of records in the database.

**Returns:** `Promise<number>` - Total count of records

**Example:**
```typescript
const count = await db.size();
console.log(`Database has ${count} records`);
```

### `clear()`

Delete all records from the database.

**Returns:** `Promise<number>` - Number of deleted records

**Example:**
```typescript
const deletedCount = await db.clear();
console.log(`Deleted ${deletedCount} records`);
```

## Advanced Query Operations

### `filter(fn)`

Filter records based on a condition function.

**Parameters:**
- `fn: (value: DatabaseValue, key: string) => boolean` - Filter function

**Returns:** `Promise<DatabaseEntry[]>` - Array of matching entries

**Example:**
```typescript
// Find all users
const users = await db.filter((value, key) => key.startsWith('user:'));

// Find active users
const activeUsers = await db.filter((value, key) => 
  key.startsWith('user:') && value.active === true
);

// Find numbers greater than 10
const bigNumbers = await db.filter((value) => 
  typeof value === 'number' && value > 10
);
```

### `map(fn)`

Transform all records using a mapping function.

**Parameters:**
- `fn: (value: DatabaseValue, key: string) => R` - Mapping function

**Returns:** `Promise<R[]>` - Array of transformed values

**Example:**
```typescript
// Get all user names
const userNames = await db.map((value, key) => 
  key.startsWith('user:') ? value.name : null
).then(names => names.filter(Boolean));

// Get all keys with their value types
const keyTypes = await db.map((value, key) => ({
  key,
  type: typeof value
}));
```

### `find(fn)`

Find the first record matching a condition.

**Parameters:**
- `fn: (value: DatabaseValue, key: string) => boolean` - Search function

**Returns:** `Promise<DatabaseEntry | undefined>` - First matching entry or undefined

**Example:**
```typescript
// Find admin user
const admin = await db.find((value, key) => 
  key.startsWith('user:') && value.role === 'admin'
);

// Find first number greater than 100
const bigNumber = await db.find((value) => 
  typeof value === 'number' && value > 100
);
```

### `some(fn)`

Check if at least one record matches a condition.

**Parameters:**
- `fn: (value: DatabaseValue, key: string) => boolean` - Test function

**Returns:** `Promise<boolean>` - True if at least one record matches

**Example:**
```typescript
// Check if any user is active
const hasActiveUser = await db.some((value, key) => 
  key.startsWith('user:') && value.active === true
);

// Check if any number is negative
const hasNegative = await db.some((value) => 
  typeof value === 'number' && value < 0
);
```

### `every(fn)`

Check if all records match a condition.

**Parameters:**
- `fn: (value: DatabaseValue, key: string) => boolean` - Test function

**Returns:** `Promise<boolean>` - True if all records match

**Example:**
```typescript
// Check if all users are active
const allUsersActive = await db.every((value, key) => 
  !key.startsWith('user:') || value.active === true
);

// Check if all numbers are positive
const allPositive = await db.every((value) => 
  typeof value !== 'number' || value >= 0
);
```

## Types

### `DatabaseValue`

Union type for all supported value types:

```typescript
type DatabaseValue = string | number | boolean | object | null | undefined;
```

### `DatabaseEntry`

Interface for database entries returned by query methods:

```typescript
interface DatabaseEntry {
  key: string;
  value: DatabaseValue;
  createdAt: Date;
  updatedAt: Date;
}
```

### `QuickPrismaOptions`

Configuration options for QuickPrisma constructor:

```typescript
interface QuickPrismaOptions {
  connectionString?: string;
  autoConnect?: boolean;
}
```

### `FilterFunction`

Type for filter/find callback functions:

```typescript
type FilterFunction<T = DatabaseValue> = (value: T, key: string) => boolean;
```

### `MapFunction`

Type for map callback functions:

```typescript
type MapFunction<T = DatabaseValue, R = any> = (value: T, key: string) => R;
```

## Error Handling

QuickPrisma methods can throw errors in various situations:

```typescript
try {
  await db.set('key', 'value');
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    console.log('Key already exists with different constraints');
  } else if (error.code === 'P2021') {
    // Table does not exist
    console.log('Database table not found - run migrations');
  } else {
    console.error('Database error:', error.message);
  }
}
```

Common Prisma error codes:
- `P2002`: Unique constraint violation
- `P2021`: Table does not exist
- `P2025`: Record not found
- `P1001`: Connection error

## Performance Notes

1. **Batch Operations**: For multiple operations, consider using transactions or the Advanced API
2. **Filtering**: Use `filter()` instead of `all()` when you need specific records
3. **Connection Pooling**: Configure connection limits in your DATABASE_URL for production
4. **Indexing**: Consider adding database indexes for frequently queried key patterns 