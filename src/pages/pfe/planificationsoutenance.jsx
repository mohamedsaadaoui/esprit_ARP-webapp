import { Helmet } from 'react-helmet-async';

import Soutenance from 'src/sections/pfe/Soutenance/PlanificationSoutenances';
// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Gestion de planification</title>
      </Helmet>

      <Soutenance/>
    </>
  );
}
