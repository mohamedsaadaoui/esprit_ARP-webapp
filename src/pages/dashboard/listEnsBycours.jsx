import { Helmet } from "react-helmet-async";

import { OrderListView } from "src/sections/emploi-temps/charge-horaire/view";

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Four</title>
      </Helmet>

      <OrderListView />
    </>
  );
}
