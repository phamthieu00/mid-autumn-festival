/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const GamesHubPage = lazy(() => import('@/pages/GamesHubPage'))
const WishesPage = lazy(() => import('@/pages/WishesPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const CatchLanternsGame = lazy(() => import('@/features/games/catch-lanterns/CatchLanternsGame'))
const MooncakeMatchGame = lazy(() => import('@/features/games/mooncake-match/MooncakeMatchGame'))
const QuizGame = lazy(() => import('@/features/games/quiz/QuizGame'))
const RunnerGame = lazy(() => import('@/features/games/runner/RunnerGame'))
const RhythmGame = lazy(() => import('@/features/games/rhythm/RhythmGame'))
const MoonPuzzleGame = lazy(() => import('@/features/games/puzzle/MoonPuzzleGame'))
const WordGuessGame = lazy(() => import('@/features/games/word/WordGuessGame'))
const LeaderboardPage = lazy(() => import('@/features/leaderboard/LeaderboardPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const ResultPage = lazy(() => import('@/features/results/ResultPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const AdminWishesPage = lazy(() => import('@/pages/AdminWishesPage'))

/** `/r/:id` is normally served by the API (OG tags); without the proxy it still opens the result card. */
function ShareRedirect() {
  const { id = '' } = useParams()
  return <Navigate to={`/results/${id}`} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'games', element: <GamesHubPage /> },
      { path: 'games/catch', element: <CatchLanternsGame /> },
      { path: 'games/match', element: <MooncakeMatchGame /> },
      { path: 'games/quiz', element: <QuizGame /> },
      { path: 'games/runner', element: <RunnerGame /> },
      { path: 'games/rhythm', element: <RhythmGame /> },
      { path: 'games/puzzle', element: <MoonPuzzleGame /> },
      { path: 'games/word', element: <WordGuessGame /> },
      { path: 'wishes', element: <WishesPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'me', element: <ProfilePage /> },
      { path: 'players/:id', element: <ProfilePage /> },
      { path: 'results/:id', element: <ResultPage /> },
      { path: 'r/:id', element: <ShareRedirect /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'admin/wishes', element: <AdminWishesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
