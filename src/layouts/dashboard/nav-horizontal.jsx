import { memo } from 'react';
import { useLocation } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { bgBlur } from 'src/theme/css';

import Scrollbar from 'src/components/scrollbar';
import { NavSectionHorizontal } from 'src/components/nav-section';

import { HEADER } from '../config-layout';
import { useNavData } from './config-navigation';
import HeaderShadow from '../common/header-shadow';

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme();
  const { user } = useMockedUser();
  const navData = useNavData();
  const location = useLocation();

  // Don't render the header if the current path is /home
  if (location.pathname === '/home') {
    return null;
  }

  return (
    <AppBar
      component="div"
      sx={{
        top: HEADER.H_DESKTOP_OFFSET,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
        }}
      >
        <Scrollbar
          sx={{
            '& .simplebar-content': {
              display: 'flex',
            },
          }}
        >
          <NavSectionHorizontal
            data={navData}
            slotProps={{
              currentRole: user?.role,
            }}
            sx={{
              ...theme.mixins.toolbar,
            }}
          />
        </Scrollbar>
      </Toolbar>
      <HeaderShadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);