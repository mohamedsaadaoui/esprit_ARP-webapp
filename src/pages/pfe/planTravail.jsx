import { Helmet } from 'react-helmet-async';

import PlanTravailView from 'src/sections/pfe/plan-travail/view';
// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Dépot plan de travail</title>
      </Helmet>

      <PlanTravailView />
    </>
  );
}
