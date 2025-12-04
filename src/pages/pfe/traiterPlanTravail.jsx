import { Helmet } from 'react-helmet-async';
import TraiterPlanTravailView from 'src/sections/pfe/traiterPlanTravail/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Traiter les plans de travail</title>
      </Helmet>
      <TraiterPlanTravailView />
    </>
  );
}
