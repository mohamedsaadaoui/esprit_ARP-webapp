import { Helmet } from 'react-helmet-async';

import EvaluationWorkflow from 'src/sections/pfe/grille/EvaluationWorkflow';
// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Gestion de evaluation</title>
      </Helmet>

      <EvaluationWorkflow/>
    </>
  );
}
