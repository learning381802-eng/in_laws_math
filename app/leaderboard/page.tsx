import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function LeaderboardPage() {
  // Fetch top users
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('points', { ascending: false })
    .limit(50)

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Top mathematicians this month
          </p>
        </div>

        {/* Top 3 Podium */}
        {users && users.length >= 3 && (
          <div className="mb-8 flex items-end justify-center gap-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="mb-2 text-4xl">🥈</div>
              <div className="flex h-32 w-32 items-center justify-center rounded-t-xl bg-gray-200 dark:bg-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users[1].name?.charAt(0) || users[1].email.charAt(0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {users[1].points} pts
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {users[1].name || 'Anonymous'}
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="mb-2 text-5xl">🥇</div>
              <div className="flex h-40 w-40 items-center justify-center rounded-t-xl bg-yellow-200 dark:bg-yellow-700">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {users[0].name?.charAt(0) || users[0].email.charAt(0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {users[0].points} pts
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {users[0].name || 'Anonymous'}
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="mb-2 text-4xl">🥉</div>
              <div className="flex h-24 w-32 items-center justify-center rounded-t-xl bg-orange-200 dark:bg-orange-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users[2].name?.charAt(0) || users[2].email.charAt(0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {users[2].points} pts
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {users[2].name || 'Anonymous'}
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Problems
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Streak
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users?.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                              ? 'bg-gray-100 text-gray-700'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                          {user.name?.charAt(0) || user.email.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-300">
                      📚 {user.solved_problems}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-300">
                      🔥 {user.streak} days
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className="font-bold text-primary-500">
                        {user.points} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/profile"
            className="inline-block rounded-lg bg-primary-500 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-600"
          >
            Go to Your Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
