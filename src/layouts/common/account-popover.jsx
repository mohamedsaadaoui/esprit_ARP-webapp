import { m } from 'framer-motion';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';

import CustomPopover, { usePopover } from 'src/components/custom-popover';
 
const OPTIONS = [
  {
    label: 'Home',
    linkTo: '/',
  },
  {
    label: 'Profile',
    linkTo: '/#1',
  },
  {
    label: 'Settings',
    linkTo: '/#2',
  },
];
export default function AccountPopover() {
  const router = useRouter();
  const {  loading,user } = useAuthContext(); 
  const popover = usePopover();
  const navigate = useNavigate();
 
  const handleLogout = async () => {
    try {
      sessionStorage.clear();
 
     
      popover.onClose();
 
      // Redirection vers la page de login
      navigate('/auth/jwt/login', { replace: true });
    } catch (error) {
      console.error(error);
    }
  };
 
  const handleClickItem = (path) => {
    popover.onClose();
    router.push(path);
  };
 
  // Check if the user is still loading
  if (loading) {
    return <div>Loading...</div>;
  }
 
  const name = sessionStorage.getItem('userId') || '';
  const lastname = sessionStorage.getItem('lastname') || '';
  const email = sessionStorage.getItem('email') || '';
 
  const handleChangePassword = () => {
    router.replace(paths.dashboard.changepwd);
    popover.onClose();
  };
 
  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {name.charAt(0)}
        </Avatar>
      </IconButton>
 
      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {`${user?.sub}`}
          </Typography>
 
        </Box>
 
        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem
          onClick={handleChangePassword}
          sx={{ m: 1, fontWeight: 'fontWeightBold' }}
        >
          Change Password
        </MenuItem>
 
        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}
 