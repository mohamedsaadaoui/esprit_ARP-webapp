import { m } from 'framer-motion';
import PropTypes from 'prop-types';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

//import { useMockedUser } from 'src/hooks/use-mocked-user';
import { useAuthContext } from 'src/auth/hooks'; // Add this import

import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

export default function RoleBasedGuard({ hasContent, roles, children, sx }) {
  const { user } = useAuthContext();
  
  // Fix: user.roles is an array, not user.role
  const userRoles = user?.roles || []; // Get the roles array
  const hasRequiredRole = roles?.some(role => userRoles.includes(role));

  if (typeof roles !== 'undefined' && !hasRequiredRole) {
    return hasContent ? (
      <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permission Denied
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            You do not have permission to access this page
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </m.div>
      </Container>
    ) : null;
  }

  return <> {children} </>;
}