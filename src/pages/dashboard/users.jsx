import { Helmet } from 'react-helmet-async';

import UserListView from 'src/sections/users/user-list-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Utilisateurs</title>
      </Helmet>

      <UserListView />
    </>
  );
}
