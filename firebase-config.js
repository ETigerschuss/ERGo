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
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "ergo-game.firebaseapp.com",
    projectId: "ergo-game",
    storageBucket: "ergo-game.appspot.com",
    messagingSenderId: "123456789",
    appId: "YOUR_APP_ID_HERE"
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
    } else {
        console.warn('⚠️ Firebase SDK not loaded. Leaderboards will be local only.');
    }
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.warn('⚠️ Falling back to local leaderboards only.');
}

// Export for use in game
window.firebaseDB = db;
window.firebaseInitialized = firebaseInitialized;
