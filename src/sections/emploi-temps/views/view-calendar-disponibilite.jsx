import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';

import HomeEdt from '../calendar-disponibilite/calendar-dispo-ens-view';

// ----------------------------------------------------------------------

export default function DispView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4"> Emploi du temps
      </Typography>

      <HomeEdt/>
    </Container>
  );
}
