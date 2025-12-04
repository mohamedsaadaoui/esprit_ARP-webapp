import { Helmet } from 'react-helmet-async';

import ReclamationEncadrantOuExpertListView from 'src/sections/pfe/reclamation/reclamation-encadrant-expert-list-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Liste des demandes de changement</title>
      </Helmet>

      <ReclamationEncadrantOuExpertListView />
    </>
  );
}
