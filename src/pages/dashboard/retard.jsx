import { Helmet } from 'react-helmet-async';

import UserListView from 'src/sections/emploi-temps/retard/retard-list-view';

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
