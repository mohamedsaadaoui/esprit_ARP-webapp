import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
 
import { useSettingsContext } from 'src/components/settings';

import HomeEdt from '../calendar-salle/calendar-salle-view';
 
// ----------------------------------------------------------------------
 
export default function SalleView() {
  const settings = useSettingsContext();
 
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Emploi Salle </Typography>
 
   <HomeEdt/>
    </Container>
  );
}
 