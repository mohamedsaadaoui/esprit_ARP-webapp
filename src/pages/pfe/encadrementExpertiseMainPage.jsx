import { Helmet } from 'react-helmet-async';

import EncadrementExpertise from 'src/sections/pfe/encadrement-expertise/encadrementExpertise';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Espace d&apos;encadrement et d&apos;expertise</title>
      </Helmet>

      <EncadrementExpertise />
    </>
  );
}
