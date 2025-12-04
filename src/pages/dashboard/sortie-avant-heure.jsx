import { Helmet } from 'react-helmet-async';

import UserListView from 'src/sections/emploi-temps/sortie-avant-heure/sah-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Seven</title>
      </Helmet>
     <UserListView />
    </>
  );
}
