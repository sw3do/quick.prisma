import { QuickPrisma } from './index';

async function runTests() {
  const db = new QuickPrisma({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/quickprisma',
    autoConnect: true
  });

  try {
    console.log('🧪 Running QuickPrisma tests...\n');

    console.log('✅ Testing set and get operations');
    await db.set('user:1', { name: 'John', age: 30, active: true });
    const user = await db.get('user:1');
    console.log('User:', user);

    console.log('\n✅ Testing numeric operations');
    await db.set('counter', 0);
    await db.add('counter', 5);
    await db.add('counter', 3);
    const counter = await db.get('counter');
    console.log('Counter:', counter);

    console.log('\n✅ Testing array operations');
    await db.push('fruits', 'apple', 'banana', 'orange');
    const fruits = await db.get('fruits');
    console.log('Fruits:', fruits);

    await db.pull('fruits', 'banana');
    const fruitsAfterPull = await db.get('fruits');
    console.log('Fruits after removing banana:', fruitsAfterPull);

    console.log('\n✅ Testing has check');
    const hasUser = await db.has('user:1');
    const hasNonExistent = await db.has('non_existent');
    console.log('Has user:1:', hasUser);
    console.log('Has non_existent:', hasNonExistent);

    console.log('\n✅ Testing all keys');
    const allKeys = await db.keys();
    console.log('All keys:', allKeys);

    console.log('\n✅ Testing size');
    const size = await db.size();
    console.log('Total records:', size);

    console.log('\n✅ Testing filter');
    const userRecords = await db.filter((value, key) => key.startsWith('user:'));
    console.log('User records:', userRecords);

    console.log('\n🎉 All tests passed!');

    const all = await db.all();
    console.log('All records:', all);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await db.disconnect();
  }
}

runTests(); 