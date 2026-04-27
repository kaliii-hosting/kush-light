import { ref, set, push } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

export const seedSampleUsers = async () => {
  try {
    console.log('Seeding sample users...');
    
    const sampleUsers = [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        status: 'active',
        isActive: true,
        role: 'customer',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        status: 'active',
        isActive: true,
        role: 'customer',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        status: 'inactive',
        isActive: false,
        role: 'customer',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'sarah.johnson@example.com',
        name: 'Sarah Johnson',
        status: 'active',
        isActive: true,
        role: 'wholesale',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        email: 'mike.brown@example.com',
        name: 'Mike Brown',
        status: 'inactive',
        isActive: false,
        role: 'customer',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const usersRef = ref(realtimeDb, 'users');
    
    // Add each user
    for (const user of sampleUsers) {
      await push(usersRef, user);
    }
    
    console.log('Sample users seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding users:', error);
    return false;
  }
};

export const clearAllUsers = async () => {
  try {
    const usersRef = ref(realtimeDb, 'users');
    await set(usersRef, null);
    console.log('All users cleared');
    return true;
  } catch (error) {
    console.error('Error clearing users:', error);
    return false;
  }
};