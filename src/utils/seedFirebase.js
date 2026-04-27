// Script to seed Firebase with initial products
import { ref, set } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { productsData } from '../data/productsData';

export const seedFirebaseProducts = async () => {
  try {
    console.log('Seeding Firebase with products...');
    
    // Create products object with unique keys
    const productsObj = {};
    productsData.forEach((product, index) => {
      const key = `-Product${index + 1}_${Date.now()}`;
      productsObj[key] = {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    // Write all products at once
    const productsRef = ref(realtimeDb, 'products');
    await set(productsRef, productsObj);
    
    console.log('Firebase seeded successfully with products:', productsObj);
    return true;
  } catch (error) {
    console.error('Error seeding Firebase:', error);
    return false;
  }
};