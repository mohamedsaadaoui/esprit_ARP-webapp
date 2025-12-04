import { Helmet } from 'react-helmet-async';

import ResultatView from 'src/sections/new-online/resultat/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Résultats</title>
      </Helmet>

      <ResultatView />
    </>
  );
}
