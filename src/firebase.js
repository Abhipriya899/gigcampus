import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAOEm5ItSLP12h7Vw4ohJ9bQG5Uk9kmIIw",
    authDomain: "gigcampus-eeef2.firebaseapp.com",
    projectId: "gigcampus-eeef2",
    storageBucket: "gigcampus-eeef2.firebasestorage.app",
    messagingSenderId: "4842718494",
    appId: "1:4842718494:web:acf47960fd17f19dc4750f",
    measurementId: "G-KXLNPV7R8G"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)