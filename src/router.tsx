import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { DetailPage } from '@/pages/DetailPage';
import { ComparePage } from '@/pages/ComparePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CollectionsPage } from '@/pages/CollectionsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import SearchPage from '@/pages/SearchPage';
import AdvancedSearchPage from '@/pages/AdvancedSearchPage';
import Statistics from '@/pages/Statistics';
import KnowledgeGraph from '@/pages/KnowledgeGraph';
import Timeline from '@/pages/Timeline';
import Map from '@/pages/Map';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      // === 需要登录才能访问的页面 ===
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'browse',
        element: (
          <ProtectedRoute>
            <BrowsePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'search',
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'advanced-search',
        element: (
          <ProtectedRoute>
            <AdvancedSearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'artifact/:id',
        element: (
          <ProtectedRoute>
            <DetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'compare',
        element: (
          <ProtectedRoute>
            <ComparePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'collections',
        element: (
          <ProtectedRoute>
            <CollectionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'statistics',
        element: (
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        ),
      },
      {
        path: 'knowledge-graph',
        element: (
          <ProtectedRoute>
            <KnowledgeGraph />
          </ProtectedRoute>
        ),
      },
      {
        path: 'timeline',
        element: (
          <ProtectedRoute>
            <Timeline />
          </ProtectedRoute>
        ),
      },
      {
        path: 'map',
        element: (
          <ProtectedRoute>
            <Map />
          </ProtectedRoute>
        ),
      },

      // === 公开路由（无需登录） ===
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
]);
