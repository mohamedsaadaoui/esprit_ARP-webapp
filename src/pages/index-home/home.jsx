import { Helmet } from 'react-helmet-async';

import EspritPortal from 'src/sections/home-index';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>ESPRIT-ERP</title>
      </Helmet>
        <EspritPortal />
    </>
  );
}
