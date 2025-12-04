import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import AuthGuard from 'src/auth/guard/auth-guard'; 

import { LoadingScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------
 
const ProfilePage = lazy(() => import('src/pages/online/profile'));
const AbsencePage = lazy(() => import('src/pages/online/absence'));
const ResultatPage = lazy(() => import('src/pages/online/resultat'))
const EdtPage = lazy(() => import('src/pages/online/edt'));
const EvaluationPage = lazy(() => import('src/pages/online/evaluation'));
const ReclamationPage = lazy(() => import('src/pages/online/reclamation')) ;
 
// ----------------------------------------------------------------------
 
export const onlineRoutes = [
  {
    path: 'online',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
       </AuthGuard>
    ),
    children: [
      { element: <ProfilePage />, index: true },
      { path:'profile',element: <ProfilePage /> },
       { path: 'absence', element: <AbsencePage /> },
      { path: 'resultat', element: <ResultatPage /> },
      { path: 'evaluation', element: <EvaluationPage /> },
      { path: 'edt', element: <EdtPage /> },
      { path: 'reclamation', element: <ReclamationPage /> },


    ],
  },
];