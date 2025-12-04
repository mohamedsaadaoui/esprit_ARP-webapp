import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';

import UserListView from '../enseignants/user-list-view';

// ----------------------------------------------------------------------

export default function TwoView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    
      <UserListView/>
    </Container>
  );
}