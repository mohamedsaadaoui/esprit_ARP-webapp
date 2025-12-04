import { Helmet } from 'react-helmet-async';

import SalleView from 'src/sections/emploi-temps/SalleView/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Emploi Salle</title>
      </Helmet>

      <SalleView />
      {/* <HomeEdt/> */}
    </>
  );
}