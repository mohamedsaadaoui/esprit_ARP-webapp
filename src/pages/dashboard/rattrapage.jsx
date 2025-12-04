import { Helmet } from 'react-helmet-async';

import RattrapageListView from 'src/sections/emploi-temps/rattrapage/rattrapage-list-view';
 
 
 
// ----------------------------------------------------------------------
 
export default function Page() {
  return (
    <>
      <Helmet>
        <title>Rattrapage</title>
      </Helmet>
 
      <RattrapageListView />
    </>
  );
}
 