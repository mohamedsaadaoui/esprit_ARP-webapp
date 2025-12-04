import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import { Checkbox, FormControlLabel } from '@mui/material';
 
import { fDate } from 'src/utils/format-time';
 
import { useGlobalData } from 'src/globalDataProvider';

import { usePopover } from 'src/components/custom-popover';
 
// Helper to parse dates in local timezone
const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};
 
// Helper to format dates as 'YYYY-MM-DD'
const formatToLocalDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
 
// eslint-disable-next-line react/prop-types
export default function EdtToolbarSemaine({ date, onManuallySelectedWeeksChange }) {
  const popover = usePopover();
  const { semestreSelectionne, semestres } = useGlobalData();
  const [weeks, setWeeks] = useState([]);
  const [manuallySelectedWeeks, setManuallySelectedWeeks] = useState([]);
  const [automaticallySelectedWeek, setAutomaticallySelectedWeek] = useState(null);
 
  // Notify parent component of manually selected weeks
  useEffect(() => {
    if (onManuallySelectedWeeksChange) {
      onManuallySelectedWeeksChange(manuallySelectedWeeks);
    }
  }, [manuallySelectedWeeks, onManuallySelectedWeeksChange]);
 
  // Generate weeks when semester is selected
  useEffect(() => {
    if (semestreSelectionne && semestres.length > 0) {
      const semestreData = semestres.find(s => s.id === semestreSelectionne);
      if (semestreData) generateWeeks(semestreData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semestreSelectionne, semestres]);
 
  // Automatically select the current week based on the provided date
  useEffect(() => {
    if (weeks.length === 0) return;
 
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
 
    const newCurrentWeek = weeks.find((week) => {
      const weekStart = new Date(week.start);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(week.end);
      weekEnd.setHours(23, 59, 59, 999);
      return currentDate >= weekStart && currentDate <= weekEnd;
    });
 
    if (newCurrentWeek) {
      if (newCurrentWeek.id !== automaticallySelectedWeek?.id) {
        setAutomaticallySelectedWeek(newCurrentWeek);
      }
    } else {
      setAutomaticallySelectedWeek(null); // Reset si dans vacances
    }
  }, [date, weeks, automaticallySelectedWeek?.id]);
 
  const { vacancesList } = useGlobalData();
 
 
     const isWeekInVacances = (weekStart, weekEnd ) => vacancesList.some(vacance => {
        // Conversion des dates de la période de vacances en objets Date
        const vacStart = new Date(vacance.dateDebut);
        const vacEnd = new Date(vacance.dateFin);
        // Vérification d'un chevauchement :
        // Il y a chevauchement si la fin de la semaine est après le début de vacances
        // et si le début de la semaine est avant la fin de vacances.
        return weekEnd >= vacStart && weekStart <= vacEnd;
      });
   
      const generateWeeks = (semestreData) => {
        const endDate = parseLocalDate(semestreData.dateFin);
        const startDate = parseLocalDate(semestreData.dateDebut);
     
        // Ajustement au dimanche précédent
        const dayOfWeek = startDate.getDay();
        const diff = -dayOfWeek;
        startDate.setDate(startDate.getDate() + diff);
     
        const weeksArray = [];
        let weekIndex = 1;
        const currentStartDate = new Date(startDate);
     
        while (currentStartDate <= endDate) {
          const weekStart = new Date(currentStartDate);
          const weekEnd = new Date(currentStartDate);
          weekEnd.setDate(weekEnd.getDate() + 6);
     
          // Vérification chevauchement avec vacances
          if (!isWeekInVacances(weekStart, weekEnd)) {
            weeksArray.push({
              id: `week-${weekIndex}`,
              label: `Semaine ${weekIndex} (${fDate(weekStart)} - ${fDate(weekEnd)})`,
              shortLabel: `S${weekIndex}`,
              start: new Date(weekStart),
              end: new Date(weekEnd),
            });
            // eslint-disable-next-line no-plusplus
            weekIndex++;
          }
          currentStartDate.setDate(currentStartDate.getDate() + 7);
        }
     
        setWeeks(weeksArray);
      };
 
  // Handle manual week selection
  const handleWeekChange = (event) => {
    const { value, checked } = event.target;
    const week = weeks.find(w => w.id === value);
    if (!week) return;
 
    // Empêche la sélection manuelle pendant les vacances
    if (isWeekInVacances(week.start, week.end)) {
      enqueueSnackbar('Sélection impossible pendant les vacances', { variant: 'error' });
      return;
    }
 
    const formattedDate = formatToLocalDate(week.start);
    setManuallySelectedWeeks(prev =>
      checked ? [...prev, formattedDate] : prev.filter(d => d !== formattedDate)
    );
  };
 
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        flexGrow={1}
        sx={{
          width: 1,
          justifyContent: 'space-between',
          overflowX: 'auto'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            flexWrap: 'nowrap',
            padding: 1
          }}
        >
          {weeks.map((week) => {
            const formattedDate = formatToLocalDate(week.start);
            const isAutoSelected = automaticallySelectedWeek
              && formattedDate === formatToLocalDate(automaticallySelectedWeek.start);
            const isManuallySelected = manuallySelectedWeeks.includes(formattedDate);
 
            return (
              <FormControlLabel
                key={week.id}
                control={
                  <Checkbox
                    value={week.id}
                    checked={isAutoSelected || isManuallySelected}
                    onChange={handleWeekChange}
                    size="small"
                  />
                }
                label={`${week.shortLabel} `} // Display the week's label
                sx={{
                  marginRight: 0,
                  '& .MuiFormControlLabel-label': {
                    whiteSpace: 'nowrap'
                  }
                }}
              />
            );
          })}
        </Stack>
 
         {/* <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton> */}
      </Stack>
 
      {/*  <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem onClick={() => console.log("Imprimer")}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimer
        </MenuItem>
      </CustomPopover> */}
    </>
  );
}