import { Helmet } from 'react-helmet-async';

import SixView from 'src/sections/emploi-temps/views/view-calendar-enseignant';
// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Six</title>
      </Helmet>

      <SixView />
      {/* <HomeEdt/> */}
    </>
  );
}
