'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { Math, MathBlock } from './Math'

export interface ProblemProps {
  question: string
  solution: string
  hints: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  problemId?: string
  showSolutionInitially?: boolean
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const difficultyPoints = {
  easy: 10,
  medium: 20,
  hard: 50,
}

export default function Problem({
  question,
  solution,
  hints,
  difficulty,
  tags = [],
  problemId,
  showSolutionInitially = false,
}: ProblemProps) {
  const { data: session } = useSession()
  const [currentHintIndex, setCurrentHintIndex] = useState(-1)
  const [isSolved, setIsSolved] = useState(false)
  const [isSolutionVisible, setIsSolutionVisible] = useState(showSolutionInitially)
  const [isLoading, setIsLoading] = useState(false)

  const showNextHint = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1)
    }
  }

  const revealSolution = () => {
    setIsSolutionVisible(true)
  }

  const handleMarkSolved = async () => {
    if (!problemId) {
      // If no problemId, just mark as solved locally for demo
      setIsSolved(true)
      return
    }

    if (!session?.user?.id) {
      alert('Please sign in to mark problems as solved and earn points!')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from('user_problems').upsert({
        user_id: session.user.id,
        problem_id: problemId,
        solved: true,
        solved_at: new Date().toISOString(),
        attempts: 1,
      })

      if (error) throw error

      setIsSolved(true)
      alert(`🎉 Problem solved! +${difficultyPoints[difficulty]} points added to your profile!`)
    } catch (error) {
      console.error('Error marking problem as solved:', error)
      alert('Failed to save progress. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🧠 Try It Yourself
        </h3>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyColors[difficulty]}`}
          >
            {difficulty === 'easy' && '🟢'}
            {difficulty === 'medium' && '🟡'}
            {difficulty === 'hard' && '🔴'}{' '}
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            +{difficultyPoints[difficulty]} pts
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <p className="text-gray-800 dark:text-gray-200">{question}</p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
          onClick={showNextHint}
          disabled={currentHintIndex >= hints.length - 1 || isSolutionVisible}
        >
          💡 Show Hint
          {currentHintIndex >= 0 && currentHintIndex < hints.length && (
            <span className="ml-2">
              ({currentHintIndex + 1}/{hints.length})
            </span>
          )}
        </button>
        {!isSolutionVisible && (
          <button
            className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            onClick={revealSolution}
          >
            👁️ Reveal Solution
          </button>
        )}
        {!isSolved && (
          <button
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            onClick={handleMarkSolved}
            disabled={isLoading || !isSolutionVisible}
            title={!isSolutionVisible ? 'Reveal the solution first!' : ''}
          >
            {isLoading ? 'Saving...' : isSolved ? '✓ Solved!' : '✓ Mark as Solved'}
          </button>
        )}
        {isSolved && (
          <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            ✓ Solved! +{difficultyPoints[difficulty]} pts
          </span>
        )}
      </div>

      {/* Hints Section */}
      {currentHintIndex >= 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>💡 Hint {currentHintIndex + 1}:</strong> {hints[currentHintIndex]}
          </p>
          {currentHintIndex < hints.length - 1 && (
            <button
              onClick={showNextHint}
              className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            >
              Show another hint →
            </button>
          )}
        </div>
      )}

      {/* Solution Section */}
      {isSolutionVisible && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
          <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
            ✨ Solution
          </h4>
          <div className="prose prose-sm max-w-none text-purple-800 dark:text-purple-200">
            {solution}
          </div>
        </div>
      )}

      {/* Sign in prompt if not authenticated */}
      {!session?.user && isSolutionVisible && !isSolved && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📝 Want to track your progress and earn points?{' '}
            <a href="/auth/signin" className="font-medium underline hover:no-underline">
              Sign in
            </a>{' '}
            to save your solutions!
          </p>
        </div>
      )}
    </div>
  )
}
