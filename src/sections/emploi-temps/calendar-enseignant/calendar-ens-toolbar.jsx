import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Chip, Button, Dialog, Checkbox, TextField, DialogTitle, Autocomplete, DialogContent, DialogActions, LinearProgress } from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';
import { useGlobalData } from 'src/globalDataProvider';
import imprimerService from 'src/services/emploi-services/imprimerService';
import enseignantService from 'src/services/emploi-services/enseignantService';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import EdtToolbarSemaine from './calendar-ens-toolbar-semaine';

const VIEW_OPTIONS = [
  { value: 'dayGridMonth', label: 'Month', icon: 'mingcute:calendar-month-line' },
  { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Day', icon: 'mingcute:calendar-day-line' },
  { value: 'listWeek', label: 'Agenda', icon: 'fluent:calendar-agenda-24-regular' },
];
 
export default function CalendarToolbar({
  date,
  view,
  onNextDate,
  // eslint-disable-next-line react/prop-types
  loading,
  onPrevDate,
  onChangeView,
  onSelectEnseignant,
  selectedTeacherId, // Keep this as it is for the prop
  // eslint-disable-next-line react/prop-types
   attachmentPath,
  onManuallyWeeksUpdate,
}) {
  const popover = usePopover();
  const smUp = useResponsive('up', 'sm');
 
  // State for teachers
  const [enseignants, setEnseignants] = useState([]);
  const [localSelectedTeacherId, setLocalSelectedTeacherId] = useState(''); // Renamed state variable
  const [openEmailPopup, setOpenEmailPopup] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const { userPermissions } = useAuthContext();
  const { cursusSelectionne} = useGlobalData();
  const [loadingEnseignants, setLoadingEnseignants] = useState(true); // État pour le chargement des enseignants

  // eslint-disable-next-line no-shadow
  const { semestreSelectionne, semestres } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres
// eslint-disable-next-line no-shadow
const findSemestreById = (semestreSelectionneId, semestres) => semestres.find(semestre => semestre.id === semestreSelectionneId);
const semestreCorrespondant = findSemestreById(semestreSelectionne, semestres);

  const { enqueueSnackbar,closeSnackbar } = useSnackbar();
   const [selectedManuallyWeeks, setSelectedManuallyWeeks] = useState([]);
   const handleManuallySelectedWeeksChange = (weeks) => {
    setSelectedManuallyWeeks(weeks);
    console.log('Semaines manuellement sélectionnées (CalendarToolbar) :', weeks);
    // Transmettre la liste vers CalendarView via la nouvelle prop
    if (onManuallyWeeksUpdate) {
      onManuallyWeeksUpdate(weeks);
    }
  };

  useEffect(() => {
    const fetchEnseignants = async () => {
      setLoadingEnseignants(true);

      try {
        const data = await enseignantService.getEnseignantsBySemestreEtCursus(semestreSelectionne, cursusSelectionne);
        
        // Trier les enseignants par nom en gérant les cas null
        const enseignantsTries = [...data].sort((a, b) => {
          // Si a.nom est null, le placer après
          if (!a.nom) return 1;
          // Si b.nom est null, le placer après
          if (!b.nom) return -1;
          // Sinon, comparer normalement
          return a.nom.localeCompare(b.nom);
        });
        
        setEnseignants(enseignantsTries);
        setLoadingEnseignants(false)
      } catch (error) {
        console.error('Erreur lors de la récupération des enseignants:', error);
      }
    };
  
    fetchEnseignants();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleTeacherChange = (event, newValue) => {
    if (newValue) {
      const selectedId = newValue.id;
      setLocalSelectedTeacherId(selectedId);
      onSelectEnseignant(selectedId);
      setEmailRecipient(newValue.email);
    }
    else 
    onSelectEnseignant();
  };
   
  // eslint-disable-next-line no-shadow
  const getPreviousSunday = (date) => {
    const currentDay = date.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
    const daysToSubtract = currentDay === 0 ? 0 : currentDay; // Si dimanche, ne rien changer
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - daysToSubtract); // Reculer jusqu'au dimanche
  
    return sunday.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('/').reverse().join('-'); // Convertir au format YYYY-MM-DD
  };
  const {  anneeSelectionne } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres


  const handleEmailSend = async () => {
    setLoadingEmail(true);
  
    // Affiche le Snackbar de chargement
    const loadingKey = enqueueSnackbar(
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LinearProgress
          color="error"
          sx={{
            height: 2,
            width: 1,
            position: 'absolute',
            bottom: 0,
            left: 0,
          }}
        /> Envoi en cours...
      </span>,
      {
        variant: 'info',
        persist: true,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
      }
    );
  
    if (!localSelectedTeacherId) {
      closeSnackbar(loadingKey); // Ferme le Snackbar de chargement
      enqueueSnackbar('Veuillez sélectionner un enseignant avant d\'envoyer l\'email.', { variant: 'warning' });
      setLoadingEmail(false);
      return;
    }
  
    const empId = localSelectedTeacherId;
    const emailToSend = emailRecipient.trim();
  
    if (!validateEmail(emailToSend)) {
      closeSnackbar(loadingKey); // Ferme le Snackbar de chargement
      enqueueSnackbar('Adresse e-mail invalide.', { variant: 'error' });
      setLoadingEmail(false);
      return;
    }
  
    const controle = true;
  
    try {
      const startDates = [...selectedManuallyWeeks];
      const formattedDate = getPreviousSunday(displayDate);
      startDates.push(formattedDate);
  
      const successMessage = await imprimerService.sendPdfByEmailEns(empId, startDates, anneeSelectionne, controle, emailToSend);
      
      // Ferme le Snackbar de chargement avant d'afficher le succès
      closeSnackbar(loadingKey);
      enqueueSnackbar(successMessage || 'Email envoyé avec succès', { 
        variant: 'success',
        autoHideDuration: 6000
      });
      setOpenEmailPopup(false);
      setEmailRecipient('');
    } catch (error) {
      console.error('Échec de l\'envoi de l\'email :', error);
      closeSnackbar(loadingKey); // Ferme le Snackbar de chargement en cas d'erreur
      enqueueSnackbar(error.message || 'Échec de l\'envoi de l\'email', { 
        variant: 'error',
        autoHideDuration: 6000
      });
    } finally {
      setLoadingEmail(false);
    }
  };
 
const handlePrint = async () => {
  if (!selectedTeacherId) {
    enqueueSnackbar('Veuillez sélectionner un enseignant avant d\'imprimer.', { variant: 'warning' });
    return;
  }

  const controle = true;

  try {
    const formattedDate = getPreviousSunday(displayDate);
    const startDateParams = [...selectedManuallyWeeks, formattedDate];

    await imprimerService.generatePdfEns(selectedTeacherId, startDateParams, anneeSelectionne, controle);
    enqueueSnackbar('PDF généré avec succès !', { variant: 'success' });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF :', error);
    // Afficher le message d'erreur exact du backend
    enqueueSnackbar(error.message || 'Erreur lors de la génération du PDF.', { 
      variant: 'error',
      autoHideDuration: 6000 // Optionnel: garder le message plus longtemps
    });
  }
};
  // Fonction de validation pour l'adresse e-mail
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // RegExp simple pour vérifier le format de l'adresse e-mail
    return re.test(String(email).toLowerCase());
  };


 
 


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
     <EdtToolbarSemaine date={displayDate} onManuallySelectedWeeksChange={handleManuallySelectedWeeksChange}/> 
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, position: 'relative' }}
      >


<Autocomplete
  style={{ width: '300px' }} // Ajustez selon vos besoins
  options={enseignants}
  getOptionLabel={(enseignant) => `${enseignant.nom} ${enseignant.prenom}`}
  renderInput={(params) => <TextField {...params} label="Enseignant" margin="none" />}
  renderOption={(props, enseignant , { selected }) => (
    <li {...props} key={enseignant.id}>
      <Checkbox key={enseignant.id} size="small" disableRipple checked={selected} />
      {`${enseignant.nom} ${enseignant.prenom}`}
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
  onChange={handleTeacherChange}
  loading={loadingEnseignants} 
  loadingText="Chargement..."
  noOptionsText="Aucun enseignant"

/>
{/*         
    <FormControl variant="outlined" size="small" sx={{ minWidth: 200, width: '300px' }}>
  <Select
    value={localSelectedTeacherId}
    onChange={handleTeacherChange}
    displayEmpty
    inputProps={{ 'aria-label': 'Enseignant' }}
    renderValue={(selected) => {
      if (!selected) return 'Sélectionnez un enseignant';
      const enseignant = enseignants.find(e => e.id === selected);
      return enseignant ? `${enseignant.nom} ${enseignant.prenom}` : 'Sélectionnez un enseignant';
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
    {enseignants.length === 0 ? (
      <MenuItem disabled>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        Chargement des enseignants...
      </MenuItem>
    ) : (
      enseignants.map((enseignant) => (
        <MenuItem key={enseignant.id} value={enseignant.id}>
          <Checkbox checked={localSelectedTeacherId === enseignant.id} />
          <ListItemText primary={`${enseignant.nom} ${enseignant.prenom}`} />
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

        
        {localSelectedTeacherId && (
  <Stack direction="row" alignItems="center" spacing={1}>
   {userPermissions.includes('IMPRIMER_EMPLOI') && (
  <IconButton onClick={handlePrint}>
    <Iconify icon="solar:printer-minimalistic-bold" />
  </IconButton>
)}
    {userPermissions.includes('SEND_EMAIL') && (
  <IconButton onClick={() => setOpenEmailPopup(true)}>
    <Iconify icon="mdi:email-outline" />
  </IconButton>
)}
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
 
      {/* Email Popup */}
     {/* Email Popup */}
{/* Email Popup */}
<Dialog open={openEmailPopup} onClose={() => setOpenEmailPopup(false)}>
  <DialogTitle>Confirmation d&apos;envoi</DialogTitle>
  <DialogContent>
    {localSelectedTeacherId && (
      <>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Enseignant : {enseignants.find(enseignant => enseignant.id === localSelectedTeacherId)?.nom} {enseignants.find(enseignant => enseignant.id === localSelectedTeacherId)?.prenom || 'Non trouvé'}
        </Typography>
        <TextField
          label="Email de l'enseignant"
          variant="outlined"
          fullWidth
          defaultValue={enseignants.find(enseignant => enseignant.id === localSelectedTeacherId)?.email || ''}
          onChange={(e) => setEmailRecipient(e.target.value)} // Ici, on met à jour l'état avec la saisie de l'utilisateur
          sx={{ mt: 2 }}
        />
      </>
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
</Dialog>
    </>
  );
}
 
CalendarToolbar.propTypes = {
  date: PropTypes.object,
  onChangeView: PropTypes.func,
  onNextDate: PropTypes.func,
  onPrevDate: PropTypes.func,
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']),
  onSelectEnseignant: PropTypes.func.isRequired,
  selectedTeacherId: PropTypes.string, // Keep this as it is for the prop
  attachmentPath: PropTypes.string,
    onManuallyWeeksUpdate: PropTypes.func, // Nouvelle prop
  
};