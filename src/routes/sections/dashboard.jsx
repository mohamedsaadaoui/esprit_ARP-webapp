import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------
 
const PageTwo = lazy(() => import('src/pages/dashboard/calendar-enseignants'));
const PageThree = lazy(() => import('src/pages/dashboard/enseignant-list')) ;
const PageFour = lazy(() => import('src/pages/dashboard/calendar-classe'));
const PageListEnsBycours = lazy(() => import('src/pages/dashboard/listEnsBycours'));

const PageFive = lazy(() => import('src/pages/dashboard/salle-list'));
const PageSix = lazy(() => import('src/pages/dashboard/calendar-enseignant'));
const PageOne = lazy(() => import('src/pages/dashboard/planning'));
const Pagedisp = lazy(() => import('src/pages/dashboard/calendar-disponibilite'));
const PageSeven = lazy(() => import('src/pages/dashboard/retard'));
const PageEight = lazy(() => import('src/pages/dashboard/sortie-avant-heure'));
const PageRattrapage = lazy(() => import('src/pages/dashboard/rattrapage'));
const PageSalle = lazy(() => import('src/pages/dashboard/calendar-salle'));
const PageUser = lazy(() => import('src/pages/dashboard/users'));
const Pagecreate = lazy(() => import('src/pages/dashboard/createuser'));
const PagePassword = lazy(() => import('src/sections/users/change-password'));


 
// ----------------------------------------------------------------------
 
export const dashboardRoutes = [
  {
    path: 'dashboard',
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
      { element: <PageTwo />, index: true },
      { path:'three',element: <PageThree /> },
      { path:'four',element: <PageFour /> },
      { path:'one',element: <PageOne /> },
      { path:'five',element: <PageFive /> },
      { path:'six',element: <PageSix /> },
      { path:'seven',element: <PageSeven /> },
      { path:'eight',element: <PageEight /> },
      { path:'disp/:idEmp',element: <Pagedisp /> },
      { path:'rattrapage',element: <PageRattrapage /> }, 
      { path:'EmploiSalle',element: <PageSalle /> }, 
      { path:'users',element: <PageUser /> }, 
      { path:'userscreate',element: <Pagecreate /> }, 
      { path: 'changepwd', element: <PagePassword /> },
      { path: 'listEnsBycours', element: <PageListEnsBycours /> },




    ],
  },
];