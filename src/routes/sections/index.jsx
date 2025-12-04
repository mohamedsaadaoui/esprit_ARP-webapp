import { Navigate, useRoutes } from 'react-router-dom';

import { PATH_AFTER_LOGIN } from 'src/config-global';

import { pfeRoutes } from './pfe';
import { mainRoutes } from './main';
import { authRoutes } from './auth';
import { homeRoutes } from './home';
import { onlineRoutes } from './online';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    },

    // Auth routes
    ...authRoutes,

    // Dashboard routes
    ...dashboardRoutes,
    
    // Online Routes
    ...onlineRoutes,
    
    ...pfeRoutes,

    // Home
    ...homeRoutes,

    // Main routes
    ...mainRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
