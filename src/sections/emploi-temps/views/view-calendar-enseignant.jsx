import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
 
import { useSettingsContext } from 'src/components/settings';

import HomeEdt from '../calendar-enseignant/calendar-ens-view';
 
// ----------------------------------------------------------------------
 
export default function SixView() {
  const settings = useSettingsContext();
 
  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Emploi Enseignants </Typography>
 
   <HomeEdt/>
    </Container>
  );
}
 