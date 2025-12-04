import { Helmet } from 'react-helmet-async';

import DispView from 'src/sections/emploi-temps/views/view-calendar-disponibilite';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: disponibilite</title>
      </Helmet>

      <DispView />
    </>
  );
}