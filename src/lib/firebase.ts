import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "studio-2536294247-eccd0",
  appId: "1:613352115496:web:067c743b1bc77038bd541d",
  apiKey: "AIzaSyAGh7ZyjOmwlWyoubd4smMWgQfi_PsGPyY",
  authDomain: "studio-2536294247-eccd0.firebaseapp.com",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
