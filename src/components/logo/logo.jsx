import PropTypes from 'prop-types';
import { forwardRef } from 'react';
 
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
 
import { RouterLink } from 'src/routes/components';

import logoImage from 'src/assets/img/esprit.png';
 
// ----------------------------------------------------------------------
 
const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  const theme = useTheme();
 

 
  // Importez votre image dans votre projet React
 
  const logo = (
    <Box
      ref={ref}
      component="div"
      sx={{
        width: 200,
        height: 100,
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    >
      {/* Utilisez la balise <img> avec le chemin de votre image */}
      <img src={logoImage} alt="Logo" style={{ width: '90%', height: '90%' }} />
    </Box>
  );
 
  if (disabledLink) {
    return logo;
  }
 
  return (
    <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});
 
Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};
 
export default Logo;
