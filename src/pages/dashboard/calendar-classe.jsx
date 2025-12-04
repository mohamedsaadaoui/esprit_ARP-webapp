import { Helmet } from 'react-helmet-async';

import FourView from 'src/sections/emploi-temps/views/view-calendar-classe';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Four</title>
      </Helmet>

      <FourView />
    </>
  );
}
