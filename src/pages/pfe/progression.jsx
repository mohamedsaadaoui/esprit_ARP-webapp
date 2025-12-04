import { Helmet } from 'react-helmet-async';
import Progression from 'src/sections/pfe/progression/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Traiter les plans de travail</title>
      </Helmet>
      <Progression />
    </>
  );
}
