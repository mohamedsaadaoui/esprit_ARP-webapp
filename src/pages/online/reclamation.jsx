import { Helmet } from 'react-helmet-async';

import ReclamationView from 'src/sections/new-online/reclamation/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Reclamation</title>
      </Helmet>

      <ReclamationView />
    </>
  );
}
