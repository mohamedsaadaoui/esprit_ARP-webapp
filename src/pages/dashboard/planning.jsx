import { Helmet } from 'react-helmet-async';

import UserListView from 'src/sections/emploi-temps/planning/plan-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: One</title>
      </Helmet>
     <UserListView />
    </>
  );
}
