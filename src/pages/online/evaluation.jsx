import { Helmet } from 'react-helmet-async';

import EvaluationView from 'src/sections/new-online/evaluation/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Evaluation</title>
      </Helmet>

      <EvaluationView />
    </>
  );
}
