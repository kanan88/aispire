import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCQXPRW4dDxWLET-u4Pq6MlUm9P6EQGRgM',
  authDomain: 'aispire-3ddd2.firebaseapp.com',
  projectId: 'aispire-3ddd2',
  storageBucket: 'aispire-3ddd2.firebasestorage.app',
  messagingSenderId: '269214896033',
  appId: '1:269214896033:web:d9bdf8f2cf4394b6d0c5e0',
  measurementId: 'G-8HHMCPVHE7'
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)
