import React from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import { useGlobalData } from 'src/globalDataProvider';
import enseignantService from 'src/services/emploi-services/enseignantService';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

const VIEW_OPTIONS = [
  {
    value: 'dayGridMonth',
    label: 'Month',
    icon: 'mingcute:calendar-month-line',
  },
  { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Day', icon: 'mingcute:calendar-day-line' },
  {
    value: 'listWeek',
    label: 'Agenda',
    icon: 'fluent:calendar-agenda-24-regular',
  },
];

 

export default function CalendarToolbar({
  date,
  view,
  onNextDate,
  // eslint-disable-next-line react/prop-types
  loading,
  onPrevDate,
  onChangeView,
  onOpenFilters,
  onSelectEnseignant,
  selectedTeacherId, 
  employeeName,
}) {
  const popover = usePopover();
  const smUp = useResponsive('up', 'sm');
  const [enseignant, setEnseignant] = React.useState(null);
  const [loadingEnseignant, setLoadingEnseignant] = React.useState(false);

    const { semestreSelectionne, semestres , cursusSelectionne } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres

 
  // eslint-disable-next-line no-shadow
  const findSemestreById = (semestreSelectionneId, semestres) => semestres.find(semestre => semestre.id === semestreSelectionneId);
  const semestreCorrespondant = findSemestreById(semestreSelectionne, semestres);
 
  const validStart = new Date(semestreCorrespondant?.dateDebut);
  const validEnd = new Date(semestreCorrespondant?.dateFin )  ;
 
  validEnd.setDate(validEnd.getDate() - 6);
 
  let displayDate = new Date(date);
  if (displayDate < validStart) {
    displayDate = validStart;
  } else if (displayDate > validEnd) {
    displayDate = validEnd;
  }

  React.useEffect(() => {
    const fetchEnseignant = async () => {
      if (selectedTeacherId) {
        setLoadingEnseignant(true);
        try {
          const data = await enseignantService.getEnseignantById(selectedTeacherId);
          setEnseignant(data);
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'enseignant:', error);
        } finally {
          setLoadingEnseignant(false);
        }
      }
    };

    fetchEnseignant();
  }, [selectedTeacherId]); // Dépendance sur selectedTeacherId

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, position: 'relative' }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#333',
                                    fontWeight: 'bold',
            padding: '6px 12px',
          }}
        >
          {loadingEnseignant ? 'Chargement...' : employeeName || 'Sélectionner un enseignant'}
        </Typography>
  
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, justifyContent: 'center' }}>
          <IconButton onClick={onPrevDate}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>
  
          <Typography variant="h6">{fDate(displayDate)}</Typography>
  
          <IconButton onClick={onNextDate}>
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Stack>
  
        
  
        {(loading || loadingEnseignant) && (
          <LinearProgress
            color="inherit"
            sx={{
              height: 2,
              width: 1,
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
          />
        )}
      </Stack>
  
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-left"
        sx={{ width: 160 }}
      >
        {VIEW_OPTIONS.map((viewOption) => (
          <MenuItem
            key={viewOption.value}
            selected={viewOption.value === view}
            onClick={() => {
              popover.onClose();
              onChangeView(viewOption.value);
            }}
          >
            <Iconify icon={viewOption.icon} />
            {viewOption.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  
  );
}

CalendarToolbar.propTypes = {
  date: PropTypes.object,
  onChangeView: PropTypes.func,
  onNextDate: PropTypes.func,
  onOpenFilters: PropTypes.func,
  onPrevDate: PropTypes.func,
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']),
  onSelectEnseignant: PropTypes.func.isRequired,
  selectedTeacherId: PropTypes.string, // Ajout de la prop ici
  employeeName: PropTypes.string, // Add this line

};