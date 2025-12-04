import { Helmet } from 'react-helmet-async';

import UserCreateView from 'src/sections/users/user-create-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Creer utilisateur</title>
      </Helmet>

      <UserCreateView />
    </>
  );
}
