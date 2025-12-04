import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  Chip,
  Button,
  Dialog,
  Checkbox,
  TextField,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { useGlobalData } from 'src/globalDataProvider';
import courService from 'src/services/emploi-services/courService';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover'; // Importez le contexte global
import { useAuthContext } from 'src/auth/hooks';
import imprimerService from 'src/services/emploi-services/imprimerService';

import EdtToolbarSemaine from './calendar-classe-toolbar-semaine';
 
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
  onOpenFilters,
  onSelectEnseignant,
  selectedTeacherId,
  // eslint-disable-next-line react/prop-types
  onSelectClass,
  // eslint-disable-next-line react/prop-types
  attachmentPath,
  onManuallyWeeksUpdate,
}) {
  const popover = usePopover();
  const { userPermissions } = useAuthContext();

  // État pour les enseignants
 
  // State for teachers and classes
  const [classes, setClasses] = React.useState([]);
  const [selectedClassId, setSelectedClassId] = React.useState('');
  // Récupération des données globales
  const { semestreSelectionne, semestres , cursusSelectionne } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres
 
 
  const [openEmailPopup, setOpenEmailPopup] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false); // Loading state for email
  const [email, setEmail] = useState('');
  const [selectedManuallyWeeks, setSelectedManuallyWeeks] = useState([]);
   const [loadingClasse, setLoadingClasse] = useState(true); // État pour le chargement des enseignants
   const { enqueueSnackbar, closeSnackbar } = useSnackbar();
 
  const handleManuallySelectedWeeksChange = (weeks) => {
    setSelectedManuallyWeeks(weeks);
    console.log('Semaines manuellement sélectionnées (CalendarToolbar) :', weeks);
    // Transmettre la liste vers CalendarView via la nouvelle prop
    if (onManuallyWeeksUpdate) {
      onManuallyWeeksUpdate(weeks);
    }
  };
 
 
  

 
 
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
 
 
  React.useEffect(() => {
 
    const fetchClasses = async () => {
      setLoadingClasse(true);

      try {
        const data = await courService.listerClassesParSemestreEtCursus(semestreSelectionne,cursusSelectionne); 
        setClasses(data);
        setLoadingClasse(false)

      } catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
      }
    };
 
    fetchClasses();
  }, [semestreSelectionne,cursusSelectionne]); // Dependency on semesterId
 
 
  const handleClassChange = (event, newValue) => {
    
    if (newValue) {
      const selectedId = newValue.id;
      setSelectedClassId(selectedId);
      onSelectClass(selectedId);
      setEmail(newValue.idClasse.emailClasse);
    }
    else 
    onSelectClass();

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
  
  const handlePrint = async () => {
    if (!selectedClassId) {
      enqueueSnackbar('Veuillez sélectionner une classe avant d\'imprimer.', { variant: 'warning' });
      return;
    }
  
    const controle = true;
  
    try {
      const formattedDate = getPreviousSunday(displayDate);
      const startDateParams = [...selectedManuallyWeeks, formattedDate];
  
      const result = await imprimerService.generatePdf(selectedClassId, startDateParams, controle);
      
      // Afficher le message de succès avec snackbar
      if (result.success) {
        enqueueSnackbar(`PDF généré avec succès !`, { variant: 'success' });
        console.log('PDF généré avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      // Afficher le message d'erreur complet
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };
 
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
  
    try {
      const classId = selectedClassId;
      const controle = true;
      const emailToSend = email.trim();
      
      if (!validateEmail(emailToSend)) {
        enqueueSnackbar('Adresse e-mail invalide.', { variant: 'error' });
        return;
      }
  
      const startDates = [...selectedManuallyWeeks];
      const formattedDate = getPreviousSunday(displayDate);
      startDates.push(formattedDate);
  
      const successMessage = await imprimerService.sendPdfByEmail(classId, startDates, controle, emailToSend);
      
      // Ferme le Snackbar de chargement avant d'afficher le succès
      closeSnackbar(loadingKey);
      enqueueSnackbar(successMessage || 'Email envoyé avec succès', { 
        variant: 'success',
        autoHideDuration: 6000
      });
      setOpenEmailPopup(false);
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
  
  // Fonction de validation pour l'adresse e-mail
  // eslint-disable-next-line no-shadow
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // RegExp simple pour vérifier le format de l'adresse e-mail
    return re.test(String(email).toLowerCase());
  };
 
 
 
  return (
    <>
      <EdtToolbarSemaine date={displayDate} onManuallySelectedWeeksChange={handleManuallySelectedWeeksChange}  />  
 
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, position: 'relative' }}
      >
 
      <Autocomplete
              style={{ width: '300px'}} // Ajustez selon vos besoins
               options={classes}
              getOptionLabel={(classe) => classe.idClasse.idClasse}
              renderInput={(params) => <TextField {...params} label="Classe" margin="none" />}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.id}>
                  <Checkbox key={option.id} size="small" disableRipple checked={selected} />
                  {option.idClasse.idClasse}
                </li>
              )}
              onChange={handleClassChange}
              loading={loadingClasse} 
              loadingText="Chargement..."
              noOptionsText="Aucun classe"
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

            />
        {/* Select pour les classes */}
        {/* <FormControl variant="outlined" size="small" sx={{ minWidth: 200, width: '300px' }}>
  <Select
    value={selectedClassId}
    onChange={handleClassChange}
    displayEmpty
    inputProps={{ 'aria-label': 'Classe' }}
    renderValue={(selected) => {
      if (!selected) return 'Sélectionnez une classe';
      const classe = classes.find(c => c.id === selected);
      return classe ? classe.idClasse.nomClasse : 'Sélectionnez une classe';
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
    {classes.length === 0 ? (
      <MenuItem disabled>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        Chargement des classes...
      </MenuItem>
    ) : (
      classes.map((classe) => (
        <MenuItem key={classe.id} value={classe.id}>
          <Checkbox checked={selectedClassId === classe.id} />
          <ListItemText primary={classe.idClasse.nomClasse} />
        </MenuItem>
      ))
    )}
  </Select>
</FormControl> */}

        {/* <Button
          onClick={handleOpenWeekDialog}
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Liste Semaines
        </Button> */}
 
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

        
        {selectedClassId && (
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
          <Dialog open={openEmailPopup} onClose={() => setOpenEmailPopup(false)}>
    <DialogTitle>Confirmation d&apos;envoi</DialogTitle>
    <DialogContent>
        {selectedClassId && (
            <TextField
                label="Email de la classe"
                variant="outlined"
                fullWidth
                // eslint-disable-next-line radix
                defaultValue={classes.find(classe => classe.idClasse.idClasse === parseInt(selectedClassId))?.idClasse.emailClasse || ''}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mt: 1 }}
            />
        )}
        <Typography variant="body2" sx={{ mt: 1 }}>
            Date de la semaine : {fDate(displayDate)}
        </Typography>
        <Typography variant="body1">
            Êtes-vous sûr de vouloir envoyer cet emploi par email ?
        </Typography>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenEmailPopup(false)} color="primary" disabled={loadingEmail}>
            Annuler
        </Button>
        <Button 
            onClick={() => {
                handleEmailSend(); // Appelle la fonction pour envoyer l'email
                setOpenEmailPopup(false); // Ferme la boîte de dialogue après l'envoi
            }} 
            color="primary" 
            disabled={loadingEmail}
        >
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
  onOpenFilters: PropTypes.func,
  onPrevDate: PropTypes.func,
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']),
  onSelectEnseignant: PropTypes.func.isRequired,
  selectedTeacherId: PropTypes.string,
  attachmentPath: PropTypes.string,
  onManuallyWeeksUpdate: PropTypes.func,  
};