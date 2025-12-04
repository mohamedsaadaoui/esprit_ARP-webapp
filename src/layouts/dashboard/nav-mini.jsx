import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { usePathname } from 'src/routes/hooks';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { hideScroll } from 'src/theme/css';
import minilogo from 'src/assets/img/esprit-arrow.png';

import { NavSectionMini } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import NavToggleButton from '../common/nav-toggle-button';

// ----------------------------------------------------------------------

export default function NavMini() {
  const { user } = useMockedUser();
  const pathname = usePathname();
  const navData = useNavData();

  // Don't render the nav if the current path is /home
  if (pathname === '/home') {
    return null;
  }

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12,
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScroll.x,
        }}
      >
<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
  <Link to="/">
    <img
      src={minilogo}
      alt="Logo"
      style={{
        height: 40,
        width: 42,
        cursor: 'pointer',
      }}
    />
  </Link>
</Box>

        <NavSectionMini
          data={navData}
          slotProps={{
            currentRole: user?.role,
          }}
        />
      </Stack>
    </Box>
  );
}