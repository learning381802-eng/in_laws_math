export type DifficultyType = 'easy' | 'medium' | 'hard'

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  solved_problems: number
  streak: number
  points: number
  last_activity: string | null
  created_at: string
  updated_at: string
}

export interface Problem {
  id: string
  question: string
  solution: string
  hints: string[]
  difficulty: DifficultyType
  tags: string[]
  points: number
  created_at: string
  updated_at: string
}

export interface UserProblem {
  id: string
  user_id: string
  problem_id: string
  attempted_at: string
  solved: boolean
  solved_at: string | null
  attempts: number
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string | null
  content: string
  timestamp: string
  is_read: boolean
}

export const difficultyPoints: Record<DifficultyType, number> = {
  easy: 10,
  medium: 20,
  hard: 50,
}
