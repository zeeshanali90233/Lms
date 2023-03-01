import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
  
const firebaseConfig = { 
  apiKey: "AIzaSyASkDp5gnme4pktd66-DBS55FITDS1w0eg",
  authDomain: "lmsp2p.firebaseapp.com",
  projectId: "lmsp2p",
  storageBucket: "lmsp2p.appspot.com",
  messagingSenderId: "497401569904",
  appId: "1:497401569904:web:03cba0bc533aed06d68ab5",
  measurementId: "G-1SDRKBYC4R"
};
  
firebase.initializeApp(firebaseConfig); 
export const db = firebase.firestore();
export const auth = firebase.auth();

