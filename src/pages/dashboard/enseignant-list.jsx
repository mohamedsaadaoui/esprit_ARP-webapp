import { Helmet } from 'react-helmet-async';

import UserListView from 'src/sections/emploi-temps/enseignants/user-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Enseignat</title>
      </Helmet>

      <UserListView />
    </>
  );
}
