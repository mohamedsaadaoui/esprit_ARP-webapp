import { Helmet } from 'react-helmet-async';

import Soutenance from 'src/sections/pfe/Soutenance/Reservationsallesoutenance';
// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Gestion de soutenance</title>
      </Helmet>

      <Soutenance/>
    </>
  );
}
