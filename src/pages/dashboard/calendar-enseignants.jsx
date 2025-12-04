import { Helmet } from 'react-helmet-async';

import TwoView from 'src/sections/emploi-temps/views/view-enseignant';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Two</title>
      </Helmet>

      <TwoView />
    </>
  );
}
