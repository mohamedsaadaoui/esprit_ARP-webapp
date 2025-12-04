import React from 'react';

import Card from '@mui/material/Card';

import { paths } from 'src/routes/paths';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import { CalendarView } from './view';


export default function HomeEdt() {


  return (
    <>
          <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Emploi du temps' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        {/* <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {classeList.map((tab) => (
            <Tab
              key={tab.id}
              iconPosition="end"
              value={tab.id}
              label={tab.nomClasse}
            />
          ))}
        </Tabs> */}
        {/* <EdtToolbarSemaine  /> */}
        <CalendarView  />
      </Card>

    </>
    );
}
