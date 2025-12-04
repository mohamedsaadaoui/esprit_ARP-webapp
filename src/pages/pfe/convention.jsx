import { Helmet } from 'react-helmet-async';

import ConventionView from 'src/sections/pfe/demande-convention/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Demander convention</title>
      </Helmet>

      <ConventionView />
    </>
  );
}
