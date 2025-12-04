import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';

import HomeEdt from '../calendar-classe/calendar-classe-view';

// ----------------------------------------------------------------------

export default function FourView() {
  const settings = useSettingsContext();

  return (
    // <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    //   <Typography variant="h4"> Edt cours </Typography>

    //   <Box
    //     sx={{
    //       mt: 5,
    //       width: 1,
    //       height: 320,
    //       borderRadius: 2,
    //       bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
    //       border: (theme) => `dashed 1px ${theme.palette.divider}`,
    //     }}
    //   />
    // </Container>

    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    <Typography variant="h4"> Emploi du temps
    </Typography>

    <HomeEdt/>
  </Container>
  );
}
