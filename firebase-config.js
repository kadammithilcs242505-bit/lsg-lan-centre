// ============================================
// L.S.G LAN CENTRE — Firebase Firestore Cloud Database
// ============================================

(function () {
  // Default configuration (Replace with your Firebase Console Web App credentials)
  // Get these from: Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration
  const defaultFirebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "lsg-lan-centre.firebaseapp.com",
    projectId: "lsg-lan-centre",
    storageBucket: "lsg-lan-centre.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
  };

  // Allow override from localStorage if set via Admin Dashboard
  let activeConfig = defaultFirebaseConfig;
  try {
    const savedCustomConfig = localStorage.getItem('lsg_firebase_config');
    if (savedCustomConfig) {
      const parsed = JSON.parse(savedCustomConfig);
      if (parsed && parsed.projectId && parsed.projectId !== 'YOUR_PROJECT_ID') {
        activeConfig = parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading saved Firebase config:', e);
  }

  let db = null;
  let isFirebaseReady = false;

  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded.');
      return false;
    }

    if (!activeConfig || !activeConfig.apiKey || activeConfig.apiKey === 'YOUR_API_KEY') {
      console.info('Firebase not configured yet. Using local storage fallback.');
      return false;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(activeConfig);
      }
      db = firebase.firestore();
      isFirebaseReady = true;
      console.log('🔥 Firebase Cloud Firestore Connected successfully for project:', activeConfig.projectId);
      return true;
    } catch (err) {
      console.error('Failed to initialize Firebase:', err);
      return false;
    }
  }

  // Attempt initial initialization
  initFirebase();

  // Public Firebase helper API for L.S.G
  window.LSG_Firebase = {
    getConfig: function () {
      return activeConfig;
    },
    saveConfig: function (newConfig) {
      try {
        localStorage.setItem('lsg_firebase_config', JSON.stringify(newConfig));
        activeConfig = newConfig;
        return initFirebase();
      } catch (e) {
        return false;
      }
    },
    isReady: function () {
      return isFirebaseReady && db !== null;
    },

    // 1. Save or update booking to Firestore
    saveBooking: async function (booking) {
      if (!this.isReady()) return false;
      try {
        const docId = booking.bookingId || ('LSG-' + Date.now());
        await db.collection('bookings').doc(docId).set({
          ...booking,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✅ Booking stored in Firebase Firestore:', docId);
        return true;
      } catch (err) {
        console.error('Error saving booking to Firestore:', err);
        return false;
      }
    },

    // 2. Real-time subscription to bookings (for Admin Dashboard)
    subscribeBookings: function (onDataCallback) {
      if (!this.isReady()) return null;
      try {
        return db.collection('bookings').onSnapshot((snapshot) => {
          const list = [];
          snapshot.forEach((doc) => {
            list.push({ firestoreId: doc.id, ...doc.data() });
          });
          onDataCallback(list);
        }, (err) => {
          console.error('Firestore subscription error:', err);
        });
      } catch (err) {
        console.error('Failed to subscribe to Firestore:', err);
        return null;
      }
    },

    // 3. Update status (e.g. Approved / Rejected)
    updateBookingStatus: async function (bookingId, status) {
      if (!this.isReady()) return false;
      try {
        await db.collection('bookings').doc(bookingId).update({
          paymentStatus: status,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Updated booking ${bookingId} to ${status} in Firestore`);
        return true;
      } catch (err) {
        console.error('Error updating status in Firestore:', err);
        return false;
      }
    },

    // 4. Delete booking from Firestore
    deleteBooking: async function (bookingId) {
      if (!this.isReady()) return false;
      try {
        await db.collection('bookings').doc(bookingId).delete();
        console.log(`🗑️ Deleted booking ${bookingId} from Firestore`);
        return true;
      } catch (err) {
        console.error('Error deleting booking from Firestore:', err);
        return false;
      }
    },

    // 5. Save contact message/inquiry
    saveInquiry: async function (inquiry) {
      if (!this.isReady()) return false;
      try {
        await db.collection('inquiries').add({
          ...inquiry,
          submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Contact inquiry saved to Firestore');
        return true;
      } catch (err) {
        console.error('Error saving inquiry to Firestore:', err);
        return false;
      }
    }
  };
})();
