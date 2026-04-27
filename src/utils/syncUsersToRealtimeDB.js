import { collection, onSnapshot } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { db, realtimeDb } from '../config/firebase';

let unsubscribe = null;

export const startUserSync = () => {
  // Only start sync if not already running
  if (unsubscribe) return;

  console.log('Starting user sync from Firestore to Realtime Database...');

  const usersRef = collection(db, 'users');
  
  unsubscribe = onSnapshot(usersRef, 
    (snapshot) => {
      const users = {};
      
      snapshot.docs.forEach((doc) => {
        const userData = doc.data();
        
        // Clean up the user data and handle undefined values
        const cleanUserData = {};
        Object.keys(userData).forEach(key => {
          const value = userData[key];
          // Skip undefined values completely
          if (value !== undefined) {
            // Handle timestamp fields specially
            if (key === 'createdAt' || key === 'lastLoginAt' || key === 'lastSeenAt') {
              cleanUserData[key] = value?.toDate?.()?.getTime() || value || null;
            } else {
              cleanUserData[key] = value;
            }
          }
        });
        
        users[doc.id] = cleanUserData;
      });

      // Write to Realtime Database
      const realtimeUsersRef = ref(realtimeDb, 'adminData/users');
      set(realtimeUsersRef, users)
        .then(() => {
          console.log(`Synced ${Object.keys(users).length} users to Realtime Database`);
        })
        .catch((error) => {
          console.error('Error syncing users to Realtime Database:', error);
        });
    },
    (error) => {
      console.error('Error listening to Firestore users:', error);
    }
  );
};

export const stopUserSync = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    console.log('Stopped user sync');
  }
};

// Don't auto-start sync - it should be started only when admin is authenticated
// startUserSync();