import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Fetch user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch recent solved problems
  const { data: solvedProblems } = await supabase
    .from('user_problems')
    .select(`
      *,
      problems (
        id,
        question,
        difficulty,
        points
      )
    `)
    .eq('user_id', session.user.id)
    .eq('solved', true)
    .order('solved_at', { ascending: false })
    .limit(5)

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Profile Header */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-300">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name || 'Anonymous Mathematician'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Points
              </div>
              <div className="text-3xl font-bold text-primary-500">
                {user.points}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Problems Solved
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {user.solved_problems}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current Streak
            </div>
            <div className="mt-2 text-3xl font-bold text-orange-500">
              🔥 {user.streak} days
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last Activity
            </div>
            <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
              {user.last_activity
                ? new Date(user.last_activity).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {solvedProblems && solvedProblems.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Recently Solved
            </h2>
            <div className="space-y-3">
              {solvedProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {problem.problems?.question?.slice(0, 60) || 'Problem'}
                      {problem.problems?.question &&
                        problem.problems.question.length > 60 &&
                        '...'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {problem.problems?.difficulty === 'easy' && '🟢'}
                      {problem.problems?.difficulty === 'medium' && '🟡'}
                      {problem.problems?.difficulty === 'hard' && '🔴'}{' '}
                      {problem.problems?.difficulty}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">
                      +{problem.problems?.points || 0} pts
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(problem.solved_at!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/leaderboard"
            className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-600"
          >
            🏆 View Leaderboard
          </Link>
          <Link
            href="/blog"
            className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            📚 Browse Problems
          </Link>
        </div>
      </div>
    </div>
  )
}
