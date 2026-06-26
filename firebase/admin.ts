import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
const initFireBseAdmin = () => {
    const apps = getApps();
    if (!apps.length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        // Handle both formats: with \n literals and with actual newlines
        const formattedKey = privateKey?.includes('\\n') 
            ? privateKey.replace(/\\n/g, '\n')
            : privateKey;
            
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: formattedKey,
            })
        });
    }
    return {
        auth: getAuth(),
        db: getFirestore()
    }
}
export const { auth, db } = initFireBseAdmin();