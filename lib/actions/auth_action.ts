'use server'
import { db, auth } from '@/firebase/admin';
import { cookies } from 'next/headers';

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;
    try {
        // Try to save to Firestore, but don't block signup if it fails
        try {
            const userRecord = await db.collection('users').doc(uid).get();
            if (userRecord.exists) {
                return { success: false, message: 'User already exists. Please sign in instead.' }
            }
            await db.collection('users').doc(uid).set({ name, email });
        } catch (dbError: any) {
            console.error("Firestore error during signup:", dbError?.message);
            // Continue anyway - user was created in Firebase Auth
        }
        return { success: true, message: 'Account created successfully. Please sign in.' }
    } catch (e: any) {
        console.error("Error creating user:", e?.message || e);
        return { success: false, message: 'There was an error creating the account. Please try again.' }
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;
    try {
        await setSessionCookie(idToken);
        return { success: true, message: 'Signed in successfully.' };
    } catch (e: any) {
        console.error('SignIn error:', e?.message || e?.code || JSON.stringify(e));
        return { success: false, message: `Sign in failed: ${e?.message || 'Unknown error'}` }
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();
    // Store the idToken directly as session - no Admin SDK needed
    cookieStore.set('session', idToken, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    });
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const parts = sessionCookie.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        const uid = payload.sub || payload.uid;
        if (!uid) return null;

        // Check if token is expired
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        // Try Firestore first, fall back to JWT claims
        try {
            const userRecord = await db.collection('users').doc(uid).get();
            if (userRecord.exists) {
                return { ...userRecord.data(), id: userRecord.id } as User;
            }
        } catch (firestoreError) {
            console.log('Firestore unavailable, using JWT claims');
        }

        // Fall back to JWT claims (name and email from Firebase token)
        return {
            id: uid,
            name: payload.name || payload.email?.split('@')[0] || 'User',
            email: payload.email || '',
        } as User;

    } catch (error: any) {
        console.log('Session error:', error?.message);
        return null;
    }
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    return { success: true };
}

export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}
