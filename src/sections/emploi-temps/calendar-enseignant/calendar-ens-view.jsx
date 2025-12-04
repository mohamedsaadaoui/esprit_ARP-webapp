import React, { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';

import { paths } from 'src/routes/paths';

import { AuthContext } from 'src/auth/context/jwt';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import { CalendarView } from './view';


export default function HomeEdt() {
  const { auth } = React.useContext(AuthContext);

  const [classeList, setClasseList] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState();
  const [currentTab, setCurrentTab] = useState(null);


  const defaultFilters = {
    name: '',
    role: [],
    status: '',
    key: '1'
  };

  const settings = useSettingsContext();
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    if (classeList.length > 0) {
      setSelectedClasse(classeList[0]);
      setCurrentTab(classeList[0].id); // Mettez à jour currentTab avec l'ID du premier élément
      setFilters((prevState) => ({
        ...prevState,
        status: classeList[0]?.nomClasse || '',
      }));
    }
  }, [classeList]);

  const handleChangeTab = useCallback(
    (event, newValue) => {
      const selectedTab = classeList.find((tab) => tab.id === newValue);
      if (selectedTab) {
        setSelectedClasse(selectedTab);
        setCurrentTab(newValue);
      }
    },
    [classeList]
  );

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
        <CalendarView selectedClasse={selectedClasse} />
      </Card>

    </>
    );
}
