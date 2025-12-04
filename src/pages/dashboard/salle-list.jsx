import { Helmet } from 'react-helmet-async';

import UserListView from 'src/sections/emploi-temps/salle/salle-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Five</title>
      </Helmet>

               <UserListView />
          
     
    </>
  );
}
