import { Helmet } from 'react-helmet-async';

import AbsenceView from 'src/sections/new-online/absence/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Absence Etudiant</title>
      </Helmet>

      <AbsenceView />
    </>
  );
}
