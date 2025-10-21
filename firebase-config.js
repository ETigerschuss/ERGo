// Firebase Configuration for ERGo! Global Leaderboards
// 
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project called "ERGo-Game"
// 3. Add a Web App to your project
// 4. Copy the configuration values below
// 5. Enable Firestore Database in "Build" -> "Firestore Database"
// 6. Use "Start in test mode" for now (we'll add security rules later)
//
// REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CONFIG:

const firebaseConfig = {
    apiKey: "AIzaSyDTuHrl0dr_C5RC_6HddM6OnM5T5gcLzfk",
    authDomain: "ergo-10d24.firebaseapp.com",
    projectId: "ergo-10d24",
    storageBucket: "ergo-10d24.firebasestorage.app",
    messagingSenderId: "551601598551",
    appId: "1:551601598551:web:ee92e129bf1f0135a7f312",
    measurementId: "G-G5NWGW33MX"
};

// Initialize Firebase (don't modify below this line)
let db = null;
let firebaseInitialized = false;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('✅ Firebase initialized successfully!');
        console.log('📊 Firebase Project:', firebaseConfig.projectId);
        console.log('🔗 Firestore Instance:', typeof db);
        
        // Enable additional logging for debugging
        firebase.firestore.setLogLevel('debug');
        
        // Test connection - write a test document then delete it
        setTimeout(() => {
            testFirestoreConnection();
        }, 1000);
    } else {
        console.warn('⚠️ Firebase SDK not loaded. Leaderboards will be local only.');
    }
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.warn('⚠️ Falling back to local leaderboards only.');
}

// Test Firestore connectivity
async function testFirestoreConnection() {
    if (!db || !firebaseInitialized) {
        console.warn('⚠️ Firebase not ready for connection test');
        return;
    }
    
    try {
        console.log('🧪 Testing Firestore connection...');
        
        // Try to write a test document
        const testRef = await db.collection('_connection_test').add({
            test: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            date: new Date().toISOString()
        });
        
        console.log('✅ Firestore WRITE test successful! Doc ID:', testRef.id);
        
        // Now delete it
        await db.collection('_connection_test').doc(testRef.id).delete();
        console.log('✅ Firestore DELETE test successful!');
        console.log('🎉 Firestore connection is working perfectly!');
        
    } catch (error) {
        console.error('❌ Firestore connection test FAILED!');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'permission-denied') {
            console.error('🔒 PERMISSION DENIED - Check your Firestore Security Rules');
            console.error('   Rules should allow: match /{document=**} { allow read, write: if true; }');
        } else if (error.code === 'failed-precondition') {
            console.error('⚙️ FAILED PRECONDITION - Firestore database may not be initialized');
            console.error('   Go to Firebase Console → Firestore Database → Create database');
        } else if (error.code === 'unauthenticated') {
            console.error('🔑 UNAUTHENTICATED - User not authenticated');
            console.error('   Test mode should allow anonymous access');
        }
    }
}

// Export for use in game
window.firebaseDB = db;
window.firebaseInitialized = firebaseInitialized;
