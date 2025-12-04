import { Helmet } from 'react-helmet-async';

import EdtView from 'src/sections/new-online/edt/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Emploi de temps</title>
      </Helmet>

      <EdtView />
    </>
  );
}
