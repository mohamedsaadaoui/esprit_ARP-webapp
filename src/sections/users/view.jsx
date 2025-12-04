import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------
 
export default function EnseignantView() {
  const settings = useSettingsContext();
 
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Utilisateurs </Typography>
 
    </Container>
  );
}
 