import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { DetailPage } from '@/pages/DetailPage';
import { ComparePage } from '@/pages/ComparePage';

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
        path: 'artifact/:id',
        element: <DetailPage />,
      },
      {
        path: 'compare',
        element: <ComparePage />,
      },
    ],
  },
]);
