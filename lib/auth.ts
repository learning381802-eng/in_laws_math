import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/database-types'

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('solved_problems, streak, points, last_activity')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user stats:', error)
    return null
  }

  return data
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data as User
}
