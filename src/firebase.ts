import {initializeApp} from 'firebase/app'

import * as firestore from 'firebase/firestore'
import * as auth from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAQpD_ADOvg0MLttRg7fbKc4oJcpIsAWCU",
  authDomain: "reactapp-notes.firebaseapp.com",
  projectId: "reactapp-notes",
  storageBucket: "reactapp-notes.appspot.com",
  messagingSenderId: "233744290607",
  appId: "1:233744290607:web:d2efabacd4e532a4eb47da"
};

initializeApp(firebaseConfig)

const authInstance = auth.getAuth()
const db = firestore.getFirestore()

export {auth, authInstance, firestore, db}