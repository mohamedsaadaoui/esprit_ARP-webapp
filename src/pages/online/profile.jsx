import { Helmet } from 'react-helmet-async';

import ProfileView from 'src/sections/new-online/profile/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Espace Etudiant</title>
      </Helmet>

      <ProfileView />
    </>
  );
}
