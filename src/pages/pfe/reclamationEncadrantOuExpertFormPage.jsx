import { Helmet } from 'react-helmet-async';

import ReclamationEncadrantOuExpertForm from 'src/sections/pfe/reclamation/ReclamationEncadrantOuExpertForm';




// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Espace d&apos;encadrement et d&apos;expertise</title>
      </Helmet>

      <ReclamationEncadrantOuExpertForm />
    </>
  );
}
