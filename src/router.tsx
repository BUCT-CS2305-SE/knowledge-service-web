import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
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
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'browse',
        element: <BrowsePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'advanced-search',
        element: <AdvancedSearchPage />,
      },
      {
        path: 'artifact/:id',
        element: <DetailPage />,
      },
      {
        path: 'compare',
        element: <ComparePage />,
      },
      // === 用户个人信息管理路由 ===
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'collections',
        element: <CollectionsPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'statistics',
        element: <Statistics />,
      },
      {
        path: 'knowledge-graph',
        element: <KnowledgeGraph />,
      },
      {
        path: 'timeline',
        element: <Timeline />,
      },
      {
        path: 'map',
        element: <Map />,
      },
    ],
  },
]);
