import { Helmet } from 'react-helmet-async';

import TraiterConventionView from 'src/sections/pfe/traiterConvention/view';
// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Traiter convention</title>
      </Helmet>

      <TraiterConventionView />
    </>
  );
}
