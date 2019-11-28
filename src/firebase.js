import Firebase from 'firebase/app'

const firebaseConfig = {
    apiKey: "AIzaSyAz4I_BzVlv2_O2SBMFs51qm8q5XCfYN7w",
    authDomain: "example-pestilence.firebaseapp.com",
    databaseURL: "https://example-pestilence.firebaseio.com",
    projectId: "example-pestilence",
    storageBucket: "example-pestilence.appspot.com",
    messagingSenderId: "112277034188",
    appId: "1:112277034188:web:44d9120085cc2ae34d1e69",
    measurementId: "G-NWSWTYPFR1"
  };

  export const App = Firebase.initializeApp(firebaseConfig);