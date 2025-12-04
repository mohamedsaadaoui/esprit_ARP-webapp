import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Chip, Checkbox, TextField, Autocomplete, LinearProgress } from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { useGlobalData } from 'src/globalDataProvider';
import salleService from 'src/services/emploi-services/salleService';

import Iconify from 'src/components/iconify';

import EdtToolbarSemaine from './calender-toolbar-semaine';


 
export default function CalendarToolbar({
  date,
  view,
  onNextDate,
  // eslint-disable-next-line react/prop-types
  loading,
  onPrevDate,
  onChangeView,
  
  // eslint-disable-next-line react/prop-types
  handlePrint,
  onSelectSalle, 
  selectedSalleId,
  attachmentPath,
}) {
 
  // State for teachers
  const [salles, setSalles] = useState([]);
  const [localSelectedSalleId, setLocalSelectedSalleId] = useState('');
  const { cursusSelectionne } = useGlobalData();
  const [loadingSalle, setLoadingSalle] = useState(true); // État pour le chargement des enseignants


 
  useEffect(() => {
    const fetchSalles = async () => {
      setLoadingSalle(true);

      try {
        const data = await salleService.getSallesByCursusId(cursusSelectionne); 
        setSalles(data);
        setLoadingSalle(false)


      } catch (error) {
        console.error('Erreur lors de la récupération des salles:', error);
      }
    };
  
    fetchSalles();
  }, [cursusSelectionne]); // Ajoutez cursusSelectionne comme dépendance si nécessaire
 
 
  const handleSalleChange  = (event, newValue) => {
    if (newValue) {
    const selectedId = newValue.id;
    setLocalSelectedSalleId(selectedId);
    onSelectSalle(selectedId); // Appelez la fonction pour sélectionner une salle
    }
    else 
    onSelectSalle();

  };
 
 
 
  const { semestreSelectionne, semestres } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres
 
 


  // eslint-disable-next-line no-shadow
  const findSemestreById = (semestreSelectionneId, semestres) => semestres.find(semestre => semestre.id === semestreSelectionneId);
  const semestreCorrespondant = findSemestreById(semestreSelectionne, semestres);
 
  const validStart = new Date(semestreCorrespondant.dateDebut);
  const validEnd = new Date(semestreCorrespondant.dateFin )  ;
 
  validEnd.setDate(validEnd.getDate() - 6);
 
  let displayDate = new Date(date);
  if (displayDate < validStart) {
    displayDate = validStart;
  } else if (displayDate > validEnd) {
    displayDate = validEnd;
  }
 


  return (
    <>
     <EdtToolbarSemaine date={displayDate} /> 
     <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, position: 'relative' }}
      >

    <Autocomplete
            style={{ width: '300px'}} // Ajustez selon vos besoins
            options={salles}
            getOptionLabel={(salle) => salle.nom}
            renderInput={(params) => <TextField {...params} label="Salle" margin="none" />}
            renderOption={(props, salle , { selected }) => (
              <li {...props} key={salle.id}>
                <Checkbox key={salle.id} size="small" disableRipple checked={selected}   />
                {salle.nom}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.title}
                  label={option.title}
                  size="small"
                />
              ))
            }
            onChange={handleSalleChange}
            loading={loadingSalle} 
            loadingText="Chargement..."
            noOptionsText="Aucune Salle"

            />
        
       {/* <FormControl variant="outlined" size="small" sx={{ minWidth: 200, width: '300px' }}>
  <Select
    value={localSelectedSalleId}
    onChange={handleSalleChange}
    displayEmpty
    inputProps={{ 'aria-label': 'Salle' }}
    renderValue={(selected) => {
      if (!selected) return 'Sélectionnez une salle';
      const salle = salles.find(s => s.id === selected);
      return salle ? salle.nom : 'Sélectionnez une salle';
    }}
    MenuProps={{
      PaperProps: {
        style: {
          maxHeight: 200, 
          width: 300, 
        },
      },
    }}
  >
    {salles.length === 0 ? (
      <MenuItem disabled>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        Chargement des salles...
      </MenuItem>
    ) : (
      salles.map((salle) => (
        <MenuItem key={salle.id} value={salle.id}>
          <Checkbox checked={localSelectedSalleId === salle.id} />
          <ListItemText primary={salle.nom} />
        </MenuItem>
      ))
    )}
  </Select>
</FormControl> */}
 
        <Stack
  direction="row"
  alignItems="center"
  justifyContent="center" // Changez ici pour centrer horizontalement
  spacing={1}
  sx={{ flexGrow: 1 }} // Ajoutez cette ligne pour permettre au Stack de prendre l'espace disponible
>
  <IconButton onClick={onPrevDate}>
    <Iconify icon="eva:arrow-ios-back-fill" />
  </IconButton>

  <Typography variant="h6">{fDate(displayDate)}</Typography>

  <IconButton onClick={onNextDate}>
    <Iconify icon="eva:arrow-ios-forward-fill" />
  </IconButton>
</Stack>

        
        {localSelectedSalleId&& (
    <Stack direction="row" alignItems="center" spacing={1}>
     {/* <IconButton onClick={handlePrint}>
      <Iconify icon="solar:printer-minimalistic-bold" />
    </IconButton> */}
      {/* <IconButton onClick={() => setOpenEmailPopup(true)}>
      <Iconify icon="mdi:email-outline" />
    </IconButton> */}
  </Stack>
 )}
 
        {loading && (
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
 
       {/* <CustomPopover
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
      </CustomPopover> */}
 
      {/* Email Popup */}
        {/* <Dialog open={openEmailPopup} onClose={() => setOpenEmailPopup(false)}>
  <DialogTitle>Confirmation d&apos;envoi</DialogTitle>
  <DialogContent>
  {localSelectedSalleId && (
      <Typography variant="body2" sx={{ mt: 1 }}>
        Salle : {salles.find(salle => salle.id === localSelectedSalleId)?.nom || 'Non trouvé'}
      </Typography>
    )}
    <Typography variant="body2" sx={{ mt: 1 }}>
      Date de la semaine : {fDate(displayDate)}
    </Typography>
    <Typography variant="body1">
      Êtes-vous sûr de vouloir envoyer cet emploi par email ?
    </Typography>
    
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEmailPopup(false)} color="primary">
      Annuler
    </Button>
    <Button onClick={handleEmailSend} color="primary" disabled={loadingEmail}>
      Envoyer
    </Button>
  </DialogActions>
</Dialog> */}
    </>
  );
}
 
CalendarToolbar.propTypes = {
  date: PropTypes.object,
  onChangeView: PropTypes.func,
  onNextDate: PropTypes.func,
  onPrevDate: PropTypes.func,
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']),
  onSelectSalle: PropTypes.func.isRequired, 
  selectedSalleId: PropTypes.string,
  attachmentPath: PropTypes.string,
  
};