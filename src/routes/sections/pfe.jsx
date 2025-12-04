import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AuthGuard from 'src/auth/guard/auth-guard';
import { RoleBasedGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import SoutenanceView from 'src/sections/pfe/soutenance/view';
import PlanificationSoutenances from 'src/sections/pfe/Soutenance/PlanificationSoutenances';
import NouvelleReservation from 'src/sections/pfe/Soutenance/NouvelleReservation';
import SalleDetails from 'src/sections/pfe/Soutenance/SalleDetails';
import Reservationsallesoutenance from 'src/sections/pfe/Soutenance/reservationsallesoutenance';
import GrilleAcademique from 'src/sections/pfe/grille/GrilleAcademique';
// ----------------------------------------------------------------------
 
const ProfilePage = lazy(() => import('src/pages/online/profile'));

const EncadrementExpertiseMainPage = lazy(() => import('src/pages/pfe/encadrementExpertiseMainPage'));
const ReclamationEncadrantOuExpertFormPage = lazy(() => import('src/pages/pfe/reclamationEncadrantOuExpertFormPage'));
const ReclamationEncadrantOuExpertListPage = lazy(() => import('src/pages/pfe/reclamationEncadrantOuExpertListPage'));


const DemandeConvention = lazy(() => import('src/pages/pfe/convention'));
const TraiterConvention = lazy(() => import('src/pages/pfe/traiterConvention'));
const PlanTravail = lazy(() => import('src/pages/pfe/planTravail'));
const TraiterPlanTravail = lazy(() => import('src/pages/pfe/traiterPlanTravail'));
const Progression = lazy(() => import('src/pages/pfe/progression'));
const GrilleMiParcours = lazy(() => import('src/sections/pfe/grille/GrilleMiParcours'));
const GrilleExpert = lazy(() => import('src/sections/pfe/grille/GrilleExpert'));
const GrilleEntreprise = lazy(() => import('src/sections/pfe/grille/GrilleEntreprise'));
const GrilleSoutenance = lazy(() => import('src/sections/pfe/grille/GrilleSoutenance'));
const EvaluationWorkflow = lazy(() => import('src/sections/pfe/grille/EvaluationWorkflow'));
// ----------------------------------------------------------------------
  
export const pfeRoutes = [
  {
    path: 'pfe',
    element: (
    //  <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
     //</AuthGuard>
    ),
    children: [
      { element: <ProfilePage />, index: true },
      { path:'profile',element: <ProfilePage /> },
      { path:'encadrement-expertise',element: <EncadrementExpertiseMainPage /> },
      { path:'soutenance',element: <SoutenanceView /> },
      { path:'demande-changement',element: <ReclamationEncadrantOuExpertFormPage /> },
      { path:'liste-demandes-changement',element: <ReclamationEncadrantOuExpertListPage /> },
      { path: 'soutenance/planification', element: ( <PlanificationSoutenances />   ) },      
      { path: 'soutenance/planification/sallesdisp', element: <Reservationsallesoutenance /> },
      
      // NouvelleReservation - Only for admin role
      { 
        path: 'soutenance/planification/nouvelle', 
        element: (
          <RoleBasedGuard roles={['code34']} hasContent>
            <NouvelleReservation />
          </RoleBasedGuard>
        ) 
      },
      
      { path: 'soutenance/planification/:id', element: <SalleDetails /> },
      {path: 'grille/GrilleAcademique', element: <GrilleAcademique /> },
      { path: 'demandeConvention', element: <DemandeConvention /> },
      { path: 'traiterConvention', element: <TraiterConvention /> },
      { path: 'planTravail', element: <PlanTravail /> },
      { path: 'traiterPlanTravail', element: <TraiterPlanTravail /> },
      { path: 'progression', element: <Progression /> },
      { path:'grille/GrilleMiParcours',element: <GrilleMiParcours /> },
      { path:'grille/GrilleExpert',element: <GrilleExpert /> },
      { path:'grille/GrilleEntreprise',element: <GrilleEntreprise /> },
      { path:'grille/GrilleSoutenance',element: <GrilleSoutenance /> },
      { path:'grille/EvaluationWorkflow',element: <EvaluationWorkflow /> },
    ],
  },
];