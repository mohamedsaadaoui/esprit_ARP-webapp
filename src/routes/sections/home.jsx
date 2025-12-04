import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------
 
const HomeIndexPage = lazy(() => import('src/pages/index-home/home'));

// ----------------------------------------------------------------------
 
export const homeRoutes = [
  {
    path: 'home',
    element: (
      // <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      // </AuthGuard>
    ),
    children: [
      { element: <HomeIndexPage />, index: true },



    ],
  },
];