# Examples

Real-world examples of using QuickPrisma in different scenarios.

## User Management System

```typescript
import { QuickPrisma } from 'quick.prisma';

const db = new QuickPrisma();

// User registration
async function registerUser(userData) {
  const userId = `user:${Date.now()}`;
  
  await db.set(userId, {
    ...userData,
    createdAt: new Date(),
    active: true,
    loginCount: 0
  });
  
  // Add to user index
  await db.push('users:all', userId);
  
  return userId;
}

// User login
async function loginUser(userId) {
  const user = await db.get(userId);
  if (!user || !user.active) {
    throw new Error('User not found or inactive');
  }
  
  // Increment login count
  await db.add(`${userId}:loginCount`, 1);
  
  // Update last login
  await db.set(`${userId}:lastLogin`, new Date());
  
  return user;
}

// Get active users
async function getActiveUsers() {
  return await db.filter((value, key) => 
    key.startsWith('user:') && value.active === true
  );
}

// Usage
const userId = await registerUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
});

await loginUser(userId);
const activeUsers = await getActiveUsers();
```

## Shopping Cart

```typescript
import { QuickPrisma } from 'quick.prisma';

const db = new QuickPrisma();

class ShoppingCart {
  constructor(userId) {
    this.userId = userId;
    this.cartKey = `cart:${userId}`;
  }

  async addItem(productId, quantity = 1, price) {
    const item = { productId, quantity, price, addedAt: new Date() };
    await db.push(this.cartKey, item);
    
    // Update cart total
    await db.add(`${this.cartKey}:total`, price * quantity);
    
    return item;
  }

  async removeItem(productId) {
    const cart = await db.get(this.cartKey) || [];
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex !== -1) {
      const item = cart[itemIndex];
      
      // Remove from cart
      await db.pull(this.cartKey, item);
      
      // Update total
      await db.subtract(`${this.cartKey}:total`, item.price * item.quantity);
    }
  }

  async getCart() {
    const items = await db.get(this.cartKey) || [];
    const total = await db.get(`${this.cartKey}:total`) || 0;
    
    return { items, total, itemCount: items.length };
  }

  async clear() {
    await db.delete(this.cartKey);
    await db.delete(`${this.cartKey}:total`);
  }
}

// Usage
const cart = new ShoppingCart('user123');

await cart.addItem('product1', 2, 29.99);
await cart.addItem('product2', 1, 15.50);

const cartData = await cart.getCart();
console.log('Cart:', cartData);
```

## Caching System

```typescript
import { QuickPrisma } from 'quick.prisma';

const db = new QuickPrisma();

class Cache {
  constructor(defaultTTL = 3600) { // 1 hour default
    this.defaultTTL = defaultTTL;
  }

  async set(key, value, ttl = this.defaultTTL) {
    const cacheKey = `cache:${key}`;
    const expiresAt = Date.now() + (ttl * 1000);
    
    await db.set(cacheKey, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
  }

  async get(key) {
    const cacheKey = `cache:${key}`;
    const cached = await db.get(cacheKey);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      await db.delete(cacheKey);
      return null;
    }
    
    return cached.value;
  }

  async delete(key) {
    const cacheKey = `cache:${key}`;
    return await db.delete(cacheKey);
  }

  async clear() {
    const cacheKeys = await db.filter((value, key) => 
      key.startsWith('cache:')
    );
    
    for (const entry of cacheKeys) {
      await db.delete(entry.key);
    }
  }

  async cleanup() {
    const now = Date.now();
    const expired = await db.filter((value, key) => 
      key.startsWith('cache:') && value.expiresAt < now
    );
    
    for (const entry of expired) {
      await db.delete(entry.key);
    }
    
    return expired.length;
  }
}

// Usage
const cache = new Cache(1800); // 30 minutes

await cache.set('user:123', { name: 'John', email: 'john@example.com' });
await cache.set('api:weather', { temp: 25, humidity: 60 }, 300); // 5 minutes

const user = await cache.get('user:123');
const weather = await cache.get('api:weather');

// Cleanup expired entries
const cleanedCount = await cache.cleanup();
```

## Analytics & Metrics

```typescript
import { QuickPrisma } from 'quick.prisma';

const db = new QuickPrisma();

class Analytics {
  async trackEvent(event, userId = null, metadata = {}) {
    const eventKey = `event:${event}:${Date.now()}`;
    
    await db.set(eventKey, {
      event,
      userId,
      metadata,
      timestamp: new Date()
    });
    
    // Increment counters
    await db.add(`counter:${event}:total`, 1);
    await db.add(`counter:${event}:${this.getDateKey()}`, 1);
    
    if (userId) {
      await db.add(`counter:${event}:user:${userId}`, 1);
    }
  }

  async getEventCount(event, period = 'total') {
    const key = period === 'total' 
      ? `counter:${event}:total`
      : `counter:${event}:${period}`;
    
    return await db.get(key) || 0;
  }

  async getTopEvents(limit = 10) {
    const counters = await db.filter((value, key) => 
      key.startsWith('counter:') && key.endsWith(':total')
    );
    
    return counters
      .map(entry => ({
        event: entry.key.split(':')[1],
        count: entry.value
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getUserActivity(userId) {
    const userCounters = await db.filter((value, key) => 
      key.includes(`:user:${userId}`)
    );
    
    return userCounters.map(entry => ({
      event: entry.key.split(':')[1],
      count: entry.value
    }));
  }

  getDateKey() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

// Usage
const analytics = new Analytics();

await analytics.trackEvent('page_view', 'user123', { page: '/home' });
await analytics.trackEvent('button_click', 'user123', { button: 'signup' });
await analytics.trackEvent('purchase', 'user456', { amount: 99.99 });

const totalPageViews = await analytics.getEventCount('page_view');
const todayClicks = await analytics.getEventCount('button_click', '2024-01-15');
const topEvents = await analytics.getTopEvents(5);
```

## Task Queue

```typescript
import { QuickPrisma } from 'quick.prisma';

const db = new QuickPrisma();

class TaskQueue {
  constructor(queueName = 'default') {
    this.queueName = queueName;
    this.queueKey = `queue:${queueName}`;
    this.processingKey = `processing:${queueName}`;
  }

  async enqueue(task, priority = 0) {
    const taskId = `task:${Date.now()}:${Math.random()}`;
    const taskData = {
      id: taskId,
      ...task,
      priority,
      createdAt: new Date(),
      status: 'pending'
    };
    
    await db.set(taskId, taskData);
    await db.push(this.queueKey, taskId);
    
    return taskId;
  }

  async dequeue() {
    const queue = await db.get(this.queueKey) || [];
    if (queue.length === 0) return null;
    
    // Get tasks and sort by priority
    const tasks = await Promise.all(
      queue.map(async (taskId) => await db.get(taskId))
    );
    
    const sortedTasks = tasks
      .filter(Boolean)
      .sort((a, b) => b.priority - a.priority);
    
    if (sortedTasks.length === 0) return null;
    
    const task = sortedTasks[0];
    
    // Move to processing
    await db.pull(this.queueKey, task.id);
    await db.push(this.processingKey, task.id);
    
    // Update status
    await db.set(task.id, { ...task, status: 'processing', startedAt: new Date() });
    
    return task;
  }

  async complete(taskId, result = null) {
    const task = await db.get(taskId);
    if (!task) return false;
    
    // Remove from processing
    await db.pull(this.processingKey, taskId);
    
    // Update task
    await db.set(taskId, {
      ...task,
      status: 'completed',
      completedAt: new Date(),
      result
    });
    
    return true;
  }

  async fail(taskId, error) {
    const task = await db.get(taskId);
    if (!task) return false;
    
    // Remove from processing
    await db.pull(this.processingKey, taskId);
    
    // Update task
    await db.set(taskId, {
      ...task,
      status: 'failed',
      failedAt: new Date(),
      error: error.message || error
    });
    
    return true;
  }

  async getStats() {
    const queue = await db.get(this.queueKey) || [];
    const processing = await db.get(this.processingKey) || [];
    
    const completed = await db.filter((value, key) => 
      key.startsWith('task:') && value.status === 'completed'
    );
    
    const failed = await db.filter((value, key) => 
      key.startsWith('task:') && value.status === 'failed'
    );
    
    return {
      pending: queue.length,
      processing: processing.length,
      completed: completed.length,
      failed: failed.length
    };
  }
}

// Usage
const queue = new TaskQueue('email');

// Add tasks
await queue.enqueue({ type: 'welcome_email', userId: 'user123' }, 1);
await queue.enqueue({ type: 'newsletter', userId: 'user456' }, 0);
await queue.enqueue({ type: 'urgent_notification', userId: 'user789' }, 2);

// Process tasks
const task = await queue.dequeue();
if (task) {
  try {
    // Process the task...
    console.log('Processing:', task);
    
    // Mark as completed
    await queue.complete(task.id, { sent: true });
  } catch (error) {
    // Mark as failed
    await queue.fail(task.id, error);
  }
}

const stats = await queue.getStats();
console.log('Queue stats:', stats);
```

## Configuration Management

```typescript
import { QuickPrisma } from 'quick.prisma';

const db = new QuickPrisma();

class ConfigManager {
  constructor(namespace = 'app') {
    this.namespace = namespace;
  }

  async set(key, value, description = '') {
    const configKey = `config:${this.namespace}:${key}`;
    
    await db.set(configKey, {
      value,
      description,
      updatedAt: new Date(),
      type: typeof value
    });
  }

  async get(key, defaultValue = null) {
    const configKey = `config:${this.namespace}:${key}`;
    const config = await db.get(configKey);
    
    return config ? config.value : defaultValue;
  }

  async getAll() {
    const configs = await db.filter((value, key) => 
      key.startsWith(`config:${this.namespace}:`)
    );
    
    const result = {};
    for (const config of configs) {
      const key = config.key.replace(`config:${this.namespace}:`, '');
      result[key] = config.value;
    }
    
    return result;
  }

  async delete(key) {
    const configKey = `config:${this.namespace}:${key}`;
    return await db.delete(configKey);
  }

  async backup() {
    const configs = await db.filter((value, key) => 
      key.startsWith(`config:${this.namespace}:`)
    );
    
    const backup = {
      namespace: this.namespace,
      timestamp: new Date(),
      configs: configs.map(config => ({
        key: config.key.replace(`config:${this.namespace}:`, ''),
        ...config.value
      }))
    };
    
    const backupKey = `backup:config:${this.namespace}:${Date.now()}`;
    await db.set(backupKey, backup);
    
    return backupKey;
  }

  async restore(backupKey) {
    const backup = await db.get(backupKey);
    if (!backup || backup.namespace !== this.namespace) {
      throw new Error('Invalid backup');
    }
    
    for (const config of backup.configs) {
      await this.set(config.key, config.value, config.description);
    }
    
    return backup.configs.length;
  }
}

// Usage
const config = new ConfigManager('myapp');

// Set configurations
await config.set('api_url', 'https://api.example.com', 'Main API endpoint');
await config.set('max_retries', 3, 'Maximum retry attempts');
await config.set('debug_mode', false, 'Enable debug logging');
await config.set('features', ['auth', 'payments'], 'Enabled features');

// Get configurations
const apiUrl = await config.get('api_url');
const maxRetries = await config.get('max_retries', 5); // with default
const allConfigs = await config.getAll();

// Backup and restore
const backupKey = await config.backup();
await config.restore(backupKey);
```

## Session Management

```typescript
import { QuickPrisma } from 'quick.prisma';

const db = new QuickPrisma();

class SessionManager {
  constructor(ttl = 86400) { // 24 hours default
    this.ttl = ttl;
  }

  async create(userId, data = {}) {
    const sessionId = this.generateSessionId();
    const sessionKey = `session:${sessionId}`;
    
    const session = {
      id: sessionId,
      userId,
      data,
      createdAt: new Date(),
      lastAccessed: new Date(),
      expiresAt: new Date(Date.now() + this.ttl * 1000)
    };
    
    await db.set(sessionKey, session);
    
    // Add to user sessions index
    await db.push(`user:${userId}:sessions`, sessionId);
    
    return sessionId;
  }

  async get(sessionId) {
    const sessionKey = `session:${sessionId}`;
    const session = await db.get(sessionKey);
    
    if (!session) return null;
    
    // Check if expired
    if (new Date() > new Date(session.expiresAt)) {
      await this.destroy(sessionId);
      return null;
    }
    
    // Update last accessed
    session.lastAccessed = new Date();
    await db.set(sessionKey, session);
    
    return session;
  }

  async update(sessionId, data) {
    const session = await this.get(sessionId);
    if (!session) return false;
    
    session.data = { ...session.data, ...data };
    session.lastAccessed = new Date();
    
    await db.set(`session:${sessionId}`, session);
    return true;
  }

  async destroy(sessionId) {
    const session = await db.get(`session:${sessionId}`);
    if (!session) return false;
    
    // Remove from user sessions
    await db.pull(`user:${session.userId}:sessions`, sessionId);
    
    // Delete session
    await db.delete(`session:${sessionId}`);
    
    return true;
  }

  async destroyAllUserSessions(userId) {
    const userSessions = await db.get(`user:${userId}:sessions`) || [];
    
    for (const sessionId of userSessions) {
      await db.delete(`session:${sessionId}`);
    }
    
    await db.delete(`user:${userId}:sessions`);
    
    return userSessions.length;
  }

  async cleanup() {
    const now = new Date();
    const expiredSessions = await db.filter((value, key) => 
      key.startsWith('session:') && new Date(value.expiresAt) < now
    );
    
    for (const session of expiredSessions) {
      await this.destroy(session.value.id);
    }
    
    return expiredSessions.length;
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Usage
const sessions = new SessionManager(3600); // 1 hour

// Create session
const sessionId = await sessions.create('user123', { 
  role: 'admin', 
  preferences: { theme: 'dark' } 
});

// Get session
const session = await sessions.get(sessionId);
console.log('Session:', session);

// Update session data
await sessions.update(sessionId, { lastPage: '/dashboard' });

// Cleanup expired sessions
const cleanedCount = await sessions.cleanup();
```

These examples demonstrate practical applications of QuickPrisma in real-world scenarios. Each example shows how to structure your data, handle common operations, and implement business logic using QuickPrisma's simple but powerful API. 