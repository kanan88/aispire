'use server'

import { db } from '@/firebase/admin'

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

    await db.collection('users').doc(uid).set({
      name,
      email
    })

    return {
      success: true,
      message: 'Account created successfully. Please sign in.'
    }
  } catch (e) {
    console.error('Error signing up:', e)

    if ((e as { code?: string }).code === 'auth/email-already-exists') {
      return {
        success: false,
        message: 'Email already exists'
      }
    }

    return {
      success: false,
      message: 'Error signing up'
    }
  }
}
