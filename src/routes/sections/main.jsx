import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

import CompactLayout from 'src/layouts/compact';

import ResetPasswordPage from 'src/sections/users/reset-pwd-mail';
import CreateNewPassword from 'src/sections/users/create-new-password';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/404'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    element: (
      <CompactLayout>
        <Outlet />
      </CompactLayout>
    ),
    children: [{ path: '404', element: <Page404 /> },
      { path: 'resetPwd', element: <ResetPasswordPage /> },
      { path: 'createPwd', element: <CreateNewPassword /> },


      ],
  },
];
