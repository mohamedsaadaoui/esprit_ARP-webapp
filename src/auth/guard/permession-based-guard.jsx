import { m } from 'framer-motion';
import PropTypes from 'prop-types';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useAuthContext } from 'src/auth/hooks';
import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';
 
export default function PermissionBasedGuard({ hasContent = true, permissions = [], children, sx }) {
  const { userPermissions } = useAuthContext();
 
  // Vérifie que TOUTES les permissions requises sont présentes
  const hasPermission = permissions.every((permission) =>
    userPermissions.includes(permission)
  );
 
  if (!hasPermission) {
    return hasContent ? (
      <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permission Refusée
          </Typography>
        </m.div>
 
        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            Vous n&apos;avez pas les autorisations nécessaires pour accéder à cette page.
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
 
  return <>{children}</>;
}
 
PermissionBasedGuard.propTypes = {
  children: PropTypes.node,
  hasContent: PropTypes.bool,
  permissions: PropTypes.arrayOf(PropTypes.string),
  sx: PropTypes.object,
};
 