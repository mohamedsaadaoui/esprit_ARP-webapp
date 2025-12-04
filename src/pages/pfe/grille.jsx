import { Helmet } from 'react-helmet-async';

import Grille from 'src/sections/pfe/grille/GrilleAcademique';
// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Gestion de grille</title>
      </Helmet>

      <Grille/>
    </>
  );
}
