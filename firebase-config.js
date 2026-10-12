// ============================================
// L.S.G LAN CENTRE — Firebase Firestore Cloud Database
// ============================================

(function () {
  // Live Firebase Configuration for lsg-lan-centre
  const defaultFirebaseConfig = {
    apiKey: "AIzaSyAbnkNWNsNva25q4daK1nTPY1gaG5Y3q9Y",
    authDomain: "lsg-lan-centre.firebaseapp.com",
    projectId: "lsg-lan-centre",
    storageBucket: "lsg-lan-centre.firebasestorage.app",
    messagingSenderId: "723353078189",
    appId: "1:723353078189:web:979812728f285bc59c3924",
    measurementId: "G-CQVZJF944K"
  };

  // Allow override from localStorage if customized
  let activeConfig = defaultFirebaseConfig;
  try {
    const savedCustomConfig = localStorage.getItem('lsg_firebase_config');
    if (savedCustomConfig) {
      const parsed = JSON.parse(savedCustomConfig);
      if (parsed && parsed.apiKey && parsed.apiKey.startsWith('AIzaSy')) {
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

  // Initial initialization
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

    // 1. Save booking, customer registration, and payment transaction
    saveBooking: async function (booking) {
      if (!this.isReady()) {
        console.warn('Firebase not ready to save booking.');
        return false;
      }
      try {
        const docId = booking.bookingId || ('LSG-BK-' + Math.floor(1000 + Math.random() * 9000));
        const cust = booking.customer || {};

        // Sanitize proof dataUrl to prevent exceeding Firestore 1MB document limit
        const sanitizedBooking = { ...booking };
        if (sanitizedBooking.proof && sanitizedBooking.proof.dataUrl) {
          if (sanitizedBooking.proof.dataUrl.length > 400000) {
            // Keep preview placeholder note if payload is too large
            sanitizedBooking.proof = {
              ...sanitizedBooking.proof,
              dataUrl: 'images/payment-scanner.png',
              dataOmitted: true,
              dataNote: 'Full high-res proof stored locally / counter verified'
            };
          }
        }

        // A. Save Reservation into 'bookings' collection
        await db.collection('bookings').doc(docId).set({
          ...sanitizedBooking,
          bookingId: docId,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✅ [Firestore] Booking stored:', docId);

        // B. Save / Register Customer into 'customers' collection
        const custPhoneClean = (cust.phone || '').replace(/[^0-9]/g, '');
        const customerDocId = custPhoneClean.length >= 8 ? custPhoneClean : ('CUST-' + docId.replace('LSG-BK-', ''));

        await db.collection('customers').doc(customerDocId).set({
          customerId: customerDocId,
          name: cust.name || 'Gamer Customer',
          phone: cust.phone || 'N/A',
          email: cust.email || 'N/A',
          discord: cust.discord || 'N/A',
          latestBookingId: docId,
          latestStation: booking.stationName || booking.stationId || 'PC Station',
          latestSlot: `${booking.date || ''} (${booking.slot || ''})`,
          latestAmount: booking.totalAmount || '₹0',
          paymentMethod: booking.paymentMethod || 'Cash',
          status: 'Active',
          lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('👤 [Firestore] Customer details registered in database:', customerDocId);

        // C. Save Payment Record into 'payments' collection
        const paymentDocId = 'PAY-' + docId.replace('LSG-BK-', '');
        await db.collection('payments').doc(paymentDocId).set({
          paymentId: paymentDocId,
          bookingId: docId,
          customerName: cust.name || 'Customer',
          customerPhone: cust.phone || 'N/A',
          amount: booking.totalAmount || '₹0',
          method: booking.paymentMethod || 'Cash',
          status: booking.paymentStatus || 'Pending Verification',
          proofFileName: (booking.proof && booking.proof.fileName) || 'Payment Counter/Receipt',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('💳 [Firestore] Payment transaction logged:', paymentDocId);

        return true;
      } catch (err) {
        console.error('Error saving booking/customer to Firestore:', err);
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

    // 3. Update status (Approved / Rejected) across bookings & payments
    updateBookingStatus: async function (bookingId, status) {
      if (!this.isReady()) return false;
      try {
        await db.collection('bookings').doc(bookingId).update({
          paymentStatus: status,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Also update matching payment record
        const paymentDocId = 'PAY-' + bookingId.replace('LSG-BK-', '');
        try {
          await db.collection('payments').doc(paymentDocId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (pe) {}

        console.log(`✅ [Firestore] Updated booking ${bookingId} to ${status}`);
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
        console.log(`🗑️ [Firestore] Deleted booking ${bookingId}`);
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
        console.log('✅ [Firestore] Contact inquiry saved');
        return true;
      } catch (err) {
        console.error('Error saving inquiry to Firestore:', err);
        return false;
      }
    }
  };
})();
