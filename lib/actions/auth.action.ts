'use server'

import { auth, db } from '@/firebase/admin'
import { cookies } from 'next/headers'

const SESSION_DURATION = 60 * 60 * 24 * 7

export const setSessionCookie = async (idToken: string) => {
  const cookieStore = await cookies()

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000
  })

  cookieStore.set('session', sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax'
  })
}

export const signUp = async (params: SignUpParams) => {
  const { uid, name, email } = params

  try {
    const userRecord = await db.collection('users').doc(uid).get()

    if (userRecord.exists) {
      return {
        success: false,
        message: 'User already exists. Please sign in.'
      }
    }

    await db.collection('users').doc(uid).set({ name, email })

    return {
      success: true,
      message: 'Account created successfully. Please sign in.'
    }
  } catch (e) {
    console.error('Error signing up:', e)

    if ((e as { code?: string }).code === 'auth/email-already-exists') {
      return {
        success: false,
        message: 'This email is already in use.'
      }
    }

    return {
      success: false,
      message: 'Failed to create an account.'
    }
  }
}

export const signIn = async (params: SignInParams) => {
  const { email, idToken } = params

  try {
    const userRecord = await auth.getUserByEmail(email)

    if (!userRecord) {
      return {
        success: false,
        message: "User doesn't exist. Create an account instead."
      }
    }

    await setSessionCookie(idToken)
  } catch (e) {
    console.error('Error signing up:', e)

    return {
      success: false,
      message: 'Error to login into account'
    }
  }
}

export const getCurrentUser = async () => {
  const cookieStore = await cookies()

  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

    const userRecord = await db.collection('users').doc(decodedClaims.uid).get()

    if (!userRecord.exists) return null

    return {
      id: decodedClaims.id,
      ...userRecord.data()
    } as User
  } catch (e) {
    console.error('Error getting current user:', e)

    return null
  }
}

export const isAuthenticated = async () => {
  const user = await getCurrentUser()

  return !!user
}

export const getInterviewByUserId = async (
  userId: string
): Promise<Interview[] | null> => {
  const interviews = await db
    .collection('interviews')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get()

  return interviews.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Interview[]
}
