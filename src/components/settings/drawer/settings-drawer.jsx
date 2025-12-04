import { useSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// eslint-disable-next-line import/no-extraneous-dependencies
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
// eslint-disable-next-line import/no-extraneous-dependencies
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Box,
  List,
  Menu,
  Grid,
  Paper,
  Modal,
  Avatar,
  Button,
  Switch,
  Dialog,
  MenuItem,
  ListItem,
  Snackbar,
  Container,
  Accordion,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  ListItemText,
  ListItemIcon,
  DialogActions,
  DialogContent,
  ListItemButton,
  ListItemAvatar,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { paper } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks';
import { useGlobalData } from 'src/globalDataProvider';
import vacanceService from 'src/services/emploi-services/vacanceService';
import semestreService from 'src/services/emploi-services/semestreService';
import periodeEpService from 'src/services/emploi-services/periodeEpService';
import jourFerieService from 'src/services/emploi-services/jourFerrieService';
import plageHoraireService from 'src/services/emploi-services/plageHoraireService';
import anneeUniversitaireService from 'src/services/emploi-services/anneeunivService';

import Label from 'src/components/label';

import Iconify from '../../iconify';
import Scrollbar from '../../scrollbar';
import BaseOptions from './base-option';
import LayoutOptions from './layout-options';
import PresetsOptions from './presets-options';
import StretchOptions from './stretch-options';
import { useSettingsContext } from '../context';
import FullScreenOption from './fullscreen-option';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500, // Largeur ajustée pour le formulaire
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2, // Coins arrondis pour la modal
};

// ----------------------------------------------------------------------

export default function SettingsDrawer() {
 

  const theme = useTheme();

  const settings = useSettingsContext();
  const { userPermissions } = useAuthContext();

  const labelStyles = {
    mb: 1.5,
    color: 'text.disabled',
    fontWeight: 'fontWeightSemiBold',
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Settings
      </Typography>

      {/* <Tooltip title="Reset">
        <IconButton onClick={settings.onReset}>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip> */}

      <IconButton onClick={settings.onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderMode = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        Mode
      </Typography>

      <BaseOptions
        value={settings.themeMode}
        onChange={(newValue) => settings.onUpdate('themeMode', newValue)}
        options={['light', 'dark']}
        icons={['sun', 'moon']}
      />
    </div>
  );

  const renderContrast = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        Contrast
      </Typography>

      <BaseOptions
        value={settings.themeContrast}
        onChange={(newValue) => settings.onUpdate('themeContrast', newValue)}
        options={['default', 'bold']}
        icons={['contrast', 'contrast_bold']}
      />
    </div>
  );

  const renderDirection = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        Direction
      </Typography>

      <BaseOptions
        value={settings.themeDirection}
        onChange={(newValue) => settings.onUpdate('themeDirection', newValue)}
        options={['ltr', 'rtl']}
        icons={['align_left', 'align_right']}
      />
    </div>
  );

  const renderLayout = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        Layout
      </Typography>

      <LayoutOptions
        value={settings.themeLayout}
        onChange={(newValue) => settings.onUpdate('themeLayout', newValue)}
        options={['vertical', 'horizontal', 'mini']}
      />
    </div>
  );

  const renderStretch = (
    <div>
      <Typography
        variant="caption"
        component="div"
        sx={{
          ...labelStyles,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        Stretch
        <Tooltip title="Only available at large resolutions > 1600px (xl)">
          <Iconify icon="eva:info-outline" width={16} sx={{ ml: 0.5 }} />
        </Tooltip>
      </Typography>

      <StretchOptions
        value={settings.themeStretch}
        onChange={() => settings.onUpdate('themeStretch', !settings.themeStretch)}
      />
    </div>
  );

  const renderPresets = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        Presets
      </Typography>

      <PresetsOptions
        value={settings.themeColorPresets}
        onChange={(newValue) => settings.onUpdate('themeColorPresets', newValue)}
      />
    </div>
  );

  const { user, isLoading: authLoading } = useAuthContext();

  const [joursFeries, setJoursFeries] = useState([]);
  const [periodeEp, setPeriodeEp] = useState([]);

  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({ nom: '', dateDebut: null, dateFin: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl0, setAnchorEl0] = useState(null);
  const [selectedPeriodeEp, setSelectedPeriodeEp] = useState(null);

  const [selectedJour, setSelectedJour] = useState(null);
  const [anneesUniversitaires, setAnneesUniversitaires] = useState([]);
  const [openModalVacance, setOpenModalVacance] = useState(false);
  // const [anneeSelectionne, setSelectedAnnee] = useState();
  const [vacances, setVacances] = useState([]);
  const [openConfirmDialog1, setOpenConfirmDialog1] = useState(false);
  const [semestres, setSemestres] = useState([]);
  const [cursusList, setCursusList] = useState([]);
 // const [cursusSelectionne, setSelectedCursus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openSemesterDialog, setOpenSemesterDialog] = useState(false); // New state for semester dialog
  const [anneeDebut, setAnneeDebut] = useState(null);
  const [anneeFin, setAnneeFin] = useState(null);
  const [openEditSemesterDialog, setOpenEditSemesterDialog] = useState(false);
  const [semesterToEdit, setSemesterToEdit] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openConfirmDialog2, setOpenConfirmDialog2] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null); // Gère quel semestre est ouvert
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    numPeriode: 0,
    nom: '',
    dateDebut: null,
    dateFin: null,
  });
  const [newPlage, setNewPlage] = useState({
    codePlageHoraire: '',
    heureDebut: null,
    heureFin: null,
    duree: '',
  });
  const [snackbarOpen1, setSnackbarOpen1] = useState(false);
  const [snackbarMessage1, setSnackbarMessage1] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openAddPeriodDialog, setOpenAddPeriodDialog] = useState(false);
  const [openAddPlageDialog, setOpenAddPlageDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriode] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [anchorEl5, setAnchorEl5] = useState(null);

  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openEditPeriodDialog, setOpenEditPeriodDialog] = useState(false);
  const [periodToEdit, setPeriodToEdit] = useState(null);
  const [periodes, setPeriodes] = useState([]);
  const [plagesHoraires, setPlagesHoraires] = useState([]);
  const [anchorEl3, setAnchorEl3] = useState(null);
  const [anchorEl4, setAnchorEl4] = useState(null);
  const [selectedPlageId, setSelectedPlageId] = useState(null);
  const [newSemester, setNewSemester] = useState({
    nomSemestre: '',
    numSemestre: '',
    dateDebut: null,
    dateFin: null,
  });
  const { enqueueSnackbar } = useSnackbar();
  const [newAnnee, setNewAnnee] = useState({
    descriptionAnnee: 'Année universitaire -/-',
    anneeDebut: null,
    anneeFin: null,
  });
  const [openEditPlageDialog, setOpenEditPlageDialog] = useState(false);
  const [editedPlage, setEditedPlage] = useState({
    codePlageHoraire: '',
    heureDebut: null,
    heureFin: null,
  });
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalEdit1, setOpenModalEdit1] = useState(false);

  const [formData1, setFormData1] = useState({
    nom: '',
    dateDebut: null,
    dateFin: null,
    type: '',
  });

  const { cursusSelectionne, anneeSelectionne  , semestreSelectionne} = useGlobalData();

  const [openConfirmDialogJour, setOpenConfirmDialogjour] = useState(false);
  const [openConfirmDialogPeriode, setOpenConfirmDialogPeriode] = useState(false);

  const [jourToDelete, setJourToDelete] = useState(null);
  const [periodeToDelete, setPeriodeToDelete] = useState(null);

  const [openConfirmDialogVacance, setOpenConfirmDialogVacance] = useState(false);
  const [vacanceToDelete, setVacanceToDelete] = useState(null);
  const [anchorElVac, setAnchorElVac] = useState(null);
  const [selectedVacance, setSelectedVacance] = useState(null);

  





// States
const [openModalUpdateVacance, setOpenModalUpdateVacance] = useState(false);
const [updateFormData, setUpdateFormData] = useState({
  nom: '',
  dateDebut: null,
  dateFin: null,
});

// Handle opening the modal with existing data
const handleOpenModalUpdateVacance = (vacance) => {
  setSelectedVacance(vacance);
  setUpdateFormData({
    nom: vacance.nom,
    dateDebut: new Date(vacance.dateDebut), // Convertir les dates en objet Date
    dateFin: new Date(vacance.dateFin),     // Convertir les dates en objet Date
  });
  setOpenModalUpdateVacance(true);
};

// Fonction pour formater la date au format YYYY-MM-DD
const formatDateToISO = (date) => {
  const formattedDate = new Date(date);
  return formattedDate.toISOString().split('T')[0]; // Extrait uniquement la date au format 'YYYY-MM-DD'
};

// Handle closing the modal
const handleCloseModalUpdateVacance = () => {
  setOpenModalUpdateVacance(false);
};

// Handle the confirm button for update
const handleConfirmUpdateVacance = () => {
  if (!selectedVacance) {
    console.error('Aucune vacance sélectionnée');
    return;
  }

  const updatedVacance = {
    nom: updateFormData.nom,
    dateDebut: formatDateToISO(updateFormData.dateDebut),
    dateFin: formatDateToISO(updateFormData.dateFin),
  };

  vacanceService.updateVacanceDates(selectedVacance.id, updatedVacance)
    .then((response) => {
      setVacances((prev) =>
        prev.map((vac) =>
          vac.id === selectedVacance.id ? { ...vac, ...updatedVacance } : vac
        )
      );
      setOpenModalUpdateVacance(false);

      // Afficher le message de succès
      enqueueSnackbar(response, {
        variant: 'success',
        autoHideDuration: 5000,
      });
    })
    .catch((error) => {
      console.error('Erreur lors de la mise à jour :', error);

      // Afficher le message d'erreur du backend
      const errorMessage = error.response?.data || 'Erreur lors de la mise à jour de la vacance';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    });
};



  // Charger les vacances pour un cursus spécifique
  const fetchVacances = async () => {
    if (cursusSelectionne) {
      try {
        const response = await vacanceService.getAllVacancesByCursus(cursusSelectionne);
        setVacances(response);
      } catch (error) {
        console.error('Erreur lors du chargement des vacances:', error);
      }
    }
  };

  useEffect(() => {
    fetchVacances(); // Charger les vacances dès le début
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursusSelectionne]);

 

  const handleDeleteVacance = async () => {
    if (vacanceToDelete) {
      try {
        const response = await vacanceService.supprimerVacance(vacanceToDelete.id);
        fetchVacances(); // Recharger la liste après la suppression
        setOpenConfirmDialogVacance(false); // Fermer la confirmation
  
        // Afficher le message de succès
        enqueueSnackbar(response, {
          variant: 'success',
          autoHideDuration: 5000,
        });
      } catch (error) {
        console.error('Erreur lors de la suppression de la vacance:', error);
  
        // Afficher le message d'erreur du backend
        const errorMessage = error.response?.data || 'Erreur lors de la suppression de la vacance';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    }
  };

  const handleOpenConfirmDialogVacance = (vacance) => {
    setVacanceToDelete(vacance);
    setOpenConfirmDialogVacance(true);
  };

  const handleCloseConfirmDialogVacance = () => {
    setOpenConfirmDialogVacance(false);
    setVacanceToDelete(null);
  };

  // Gestion du menu
  const handleMenuOpenVac = (event, vacance) => {
    setAnchorElVac(event.currentTarget);
    setSelectedVacance(vacance);
  };

  const handleMenuCloseVac = () => {
    setAnchorElVac(null);
    setSelectedVacance(null);
  }

  
  const handleOpenConfirmDialogJour = (jour) => {
    setJourToDelete(jour);
    setOpenConfirmDialogjour(true);
  };
    
  const handleOpenConfirmDialogPeriode = (periode) => {
    setPeriodeToDelete(periode);
    setOpenConfirmDialogPeriode(true);
  };
  const handleCloseConfirmDialogPeriode = () => {
    setOpenConfirmDialogPeriode(false);
    setPeriodeToDelete(null);
  };
  const handleCloseConfirmDialogJour = () => {
    setOpenConfirmDialogjour(false);
    setJourToDelete(null);
  };
  

  const fetchJoursFeriesAfterDelete = async () => {
    if (authLoading || !user) return;
    try {
      const response = await jourFerieService.getAllJoursFeries(anneeSelectionne); // Passez l'année universitaire sélectionnée
      setJoursFeries(response); // Mettez à jour l'état
      console.log('Jours fériés rechargés:', response);
    } catch (error) {
      console.error('Erreur lors de la récupération des jours fériés:', error);
    }
  };




  const handleConfirmDeleteJour = async () => {
    if (jourToDelete) {
      try {
        const response = await jourFerieService.supprimerJourFerie(jourToDelete.id);
        enqueueSnackbar(response, {
          variant: 'success',
          autoHideDuration: 5000,
        });
        
        // Actualisez la liste après la suppression
        await fetchJoursFeriesAfterDelete();
        console.log('Jour férié supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du jour férié:', error);
        const errorMessage = error.response?.data || "Erreur lors de la suppression du jour férié.";
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    }
    handleCloseConfirmDialogJour();
  };
  

  useEffect(() => {
    if (cursusSelectionne) {
      const fetchPlagesHoraires = async () => {
        try {
          const data = await plageHoraireService.listerPlagesHorairesParCursus(cursusSelectionne);
          setPlagesHoraires(data);
        } catch (err) {
          // eslint-disable-next-line no-undef
          setError(err);
        }
      };
      fetchPlagesHoraires();
    }
  }, [cursusSelectionne]);

  const handleOpenAddPlageDialog = () => {
    setOpenAddPlageDialog(true);
  };

  const handleCloseAddPlageDialog = () => {
    setOpenAddPlageDialog(false);
  };

  const handleAjouterPlageHoraire = async () => {
    if (!cursusSelectionne) {
      enqueueSnackbar('Veuillez sélectionner un cursus', {
        variant: 'warning',
        autoHideDuration: 5000,
      });
      return;
    }
  
    try {
      const newPlageHoraire = {
        codePlageHoraire: newPlage.codePlageHoraire,
        heureDebut: newPlage.heureDebut ? newPlage.heureDebut.toTimeString().slice(0, 5) : null,
        heureFin: newPlage.heureFin ? newPlage.heureFin.toTimeString().slice(0, 5) : null,
        duree: newPlage.duree,
      };
  
      const response = await plageHoraireService.ajouterPlageHoraire(
        cursusSelectionne,
        newPlageHoraire
      );
  
      // Afficher le message de succès du backend
      enqueueSnackbar(response.message, {
        variant: 'success',
        autoHideDuration: 5000,
      });
  
      // Mettre à jour l'état des plages horaires
      setPlagesHoraires((prevPlages) => [...prevPlages, response.data]);
  
      // Rafraîchir la liste
      await fetchPlagesHoraires();
  
      handleCloseAddPlageDialog();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la plage horaire:", error);
      
      // Afficher le message d'erreur complet du backend
      enqueueSnackbar(error.message, {
        variant: 'error',
        autoHideDuration: 8000, // Durée plus longue pour les erreurs
      });
    }
  };
  const fetchPlagesHoraires = async () => {
    if (cursusSelectionne) {
      try {
        const data = await plageHoraireService.listerPlagesHorairesParCursus(cursusSelectionne);
        setPlagesHoraires(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des plages horaires:', err);
      }
    }
  };
  const handleUpdatePlageHoraire = async () => {
    if (!editedPlage) return;
  
    const updatedPlage = {
      codePlageHoraire: editedPlage.codePlageHoraire,
      heureDebut: editedPlage.heureDebut
        ? editedPlage.heureDebut.toTimeString().slice(0, 5)
        : null,
      heureFin: editedPlage.heureFin 
        ? editedPlage.heureFin.toTimeString().slice(0, 5) 
        : null,
      duree: editedPlage.duree !== null ? editedPlage.duree : 0,
    };
  
    try {
      const response = await plageHoraireService.updatePlageHoraire(
        selectedPlageId,
        updatedPlage
      );
  
      // Afficher le message de succès du backend
      enqueueSnackbar(response.message, {
        variant: 'success',
        autoHideDuration: 5000,
      });
  
      // Rafraîchir la liste
      fetchPlagesHoraires();
      setOpenEditPlageDialog(false);
  
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      
      // Afficher le message d'erreur exact
      enqueueSnackbar(error.message, {
        variant: 'error',
        autoHideDuration: 8000, // Plus long pour les erreurs
      });
    }
  };

  useEffect(() => {
    fetchPlagesHoraires();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursusSelectionne]);

  const parseTimeStringToDate = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    return new Date(1970, 0, 1, hours, minutes); // Date fixe pour l'heure
  };

  // Exemple d'utilisation dans votre code
  const handleOpenEditPlageDialog = () => {
    console.log("ID de plage sélectionné:", selectedPlageId);
    const plage = plagesHoraires.find((p) => p.id === selectedPlageId);
    if (plage) {
      setEditedPlage({
        codePlageHoraire: plage.codePlageHoraire,
        heureDebut: parseTimeStringToDate(plage.heureDebut), 
        heureFin: parseTimeStringToDate(plage.heureFin),
        duree: plage.duree || 0,
      });
      setSelectedPlageId(plage.id)
      setOpenEditPlageDialog(true);
    } else {
      console.error("Plage non trouvée pour l'ID:", selectedPlageId);
    }
  };
  
  
  const openDialogForPlage = (plageId) => {
    const plage = plagesHoraires.find((p) => p.id === plageId);
    if (plage) {
      handleOpenEditPlageDialog(plage);
    }
  };

  const handleDeletePlageHoraire = () => {
    console.log('selectedPlageId avant confirmation:', selectedPlageId); // Log pour débogage
    if (selectedPlageId) {
      setOpenConfirmDialog1(true); // Ouvre le dialogue de confirmation
    } else {
      console.error('Aucune plage horaire sélectionnée pour la suppression.');
    }
  };

  const confirmDeletePlage = async () => {
    console.log('selectedPlageId dans confirmDeletePlage:', selectedPlageId); // Log pour débogage

    if (selectedPlageId !== null) {
      try {
        const response = await plageHoraireService.deletePlageHoraire(selectedPlageId);

        // Afficher le message de succès du backend
        enqueueSnackbar(response, {
          variant: 'success',
          autoHideDuration: 5000,
        });

        // Mettre à jour la liste des plages horaires
        setPlagesHoraires((prevPlages) =>
          prevPlages.filter((plage) => plage.id !== selectedPlageId)
        );
        console.log('Plage horaire supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de la plage horaire:', error);
        const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression.';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
        });
      } finally {
        setOpenConfirmDialog1(false); // Ferme le dialogue
        handleMenuClose(); // Ferme le menu
      }
    } else {
      enqueueSnackbar('Aucune plage horaire sélectionnée.', {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };
  const handleChangeEtatPlageHoraire = async (plagehoraireId) => {
    if (!userPermissions.includes('UPDATE_ETAT_PLAGE_HORAIRE')) {
      console.error("Vous n'avez pas la permission de mettre à jour l'état de la plage horaire.");
      return; // Exit the function if permission is not granted
    }
  
    try {
      const updatedPlage = await plageHoraireService.changerEtatPlageHoraire(plagehoraireId);
      setPlagesHoraires((prevPlages) =>
        prevPlages.map((plage) => (plage.id === updatedPlage.id ? updatedPlage : plage))
      );
      console.log('État de la plage horaire mis à jour:', updatedPlage);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état de la plage horaire:", error);
    }
  };
  const handleHeureDebutChange = (newValue) => {
    setNewPlage({ ...newPlage, heureDebut: newValue });
    calculateDuration(newValue, newPlage.heureFin);
  };

  const handleHeureFinChange = (newValue) => {
    setNewPlage({ ...newPlage, heureFin: newValue });
    calculateDuration(newPlage.heureDebut, newValue);
  };

  const calculateDuration = (debut, fin) => {
    if (debut && fin) {
      const duration = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60); // en heures
      setNewPlage((prev) => ({ ...prev, duree: duration }));
    }
  };

  const calculateDurationUpdate = (heureDebut, heureFin) => {
    if (heureDebut && heureFin) {
      return (heureFin.getTime() - heureDebut.getTime()) / (1000 * 60 * 60); // en heures
    }
    return null;
  };

  const handleHeureDebutChangeUpdate = (newValue) => {
    setEditedPlage((prev) => {
      const updatedPlage = { ...prev, heureDebut: newValue };
      const newDuree = calculateDurationUpdate(newValue, prev.heureFin);
      return { ...updatedPlage, duree: newDuree };
    });
  };

  const handleHeureFinChangeUpdate = (newValue) => {
    setEditedPlage((prev) => {
      const updatedPlage = { ...prev, heureFin: newValue };
      const newDuree = calculateDurationUpdate(prev.heureDebut, newValue);
      return { ...updatedPlage, duree: newDuree };
    });
  };

  const handleMenuClick1 = (event, plage) => {
    setAnchorEl4(event.currentTarget);
    setSelectedPlageId(plage.id);
    // Vous pouvez définir des actions supplémentaires ici
  };

  useEffect(() => {
    if (cursusSelectionne) {
      // eslint-disable-next-line no-shadow
      const fetchVacances = async () => {
        try {
          const data = await vacanceService.getAllVacancesByCursus(cursusSelectionne);
          setVacances(data);
        } catch (error) {
          console.error('Erreur lors de la récupération des vacances:', error);
        }
      };
      fetchVacances();
    }
  }, [cursusSelectionne]);


  const handleOpenModalVacances = () => {
    setOpenModalVacance(true);
  };

  const handleCloseModalVacances = () => {
    setOpenModalVacance(false);
    setFormData({ nom: '', dateDebut: null, dateFin: null });
  };

  const handleSubmitAddVacance = async () => {
    try {
      // Afficher les dates avant conversion pour débogage
      console.log('Date de début avant conversion:', formData.dateDebut);
      console.log('Date de fin avant conversion:', formData.dateFin);
  
      // Conversion des dates au format ISO (en UTC)
      const dateDebut = formData.dateDebut
        ? new Date(
            Date.UTC(
              formData.dateDebut.getFullYear(),
              formData.dateDebut.getMonth(),
              formData.dateDebut.getDate()
            )
          ).toISOString()
        : null;
  
      const dateFin = formData.dateFin
        ? new Date(
            Date.UTC(
              formData.dateFin.getFullYear(),
              formData.dateFin.getMonth(),
              formData.dateFin.getDate()
            )
          ).toISOString()
        : null;
  
      // Préparation des données pour le backend
      const vacanceToAdd = {
        ...formData, // Inclure les autres données du formulaire
        dateDebut,
        dateFin,
      };
  
      console.log('Vacance à ajouter:', JSON.stringify(vacanceToAdd)); // Log pour débogage
  
      // Appel au service pour ajouter la vacance
      const response = await vacanceService.ajouterVacance(cursusSelectionne, vacanceToAdd);
  
      // Afficher le message de succès retourné par le backend
      enqueueSnackbar(response, {
        variant: 'success',
        autoHideDuration: 5000,
      });
  
      handleCloseModalVacances();
  
      // Met à jour la liste des vacances
      const updatedVacances = await vacanceService.getAllVacancesByCursus(cursusSelectionne);
      setVacances(updatedVacances);
    } catch (error) {
      console.error('Erreur lors de l’ajout de la vacance:', error);
  
      // Afficher le message d'erreur via Snackbar
      enqueueSnackbar(error.response?.data || 'Erreur lors de l’ajout de la vacance.', {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };

  useEffect(() => {
    if (cursusSelectionne) {
      // eslint-disable-next-line no-shadow
      const fetchVacances = async () => {
        try {
          const data = await vacanceService.getAllVacancesByCursus(cursusSelectionne);
          setVacances(data);
        } catch (error) {
          console.error('Erreur lors de la récupération des vacances:', error);
        }
      };
      fetchVacances();
    }
  }, [cursusSelectionne]);

  useEffect(() => {
    fetchData();
    fetchCursusData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {

    try {
      const result = await anneeUniversitaireService.getAllAnneesUniversitaires();
      setAnneesUniversitaires(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des années universitaires :', error);
    }
  };
  
  const handleAccordionChange = (semestreId) => {
    // Si l'accordion est déjà ouvert, on le ferme (toggle)
    setOpenAccordion(openAccordion === semestreId ? null : semestreId);
  };

  const fetchCursusData = async () => {
    if (authLoading || !user) return;

    try {
      const result = await semestreService.listerTousLesCursus();
      setCursusList(result);
    } catch (error) {
      console.error('Erreur lors de la récupération des cursus :', error);
    }
  };

  const handleMenuClick = (event, semestre) => {
    setAnchorEl(event.currentTarget);
    setSelectedSemester(semestre); // Assurez-vous que cela définit correctement selectedSemester
  };

  const handleEditS = (semestre) => {
    console.log('Semestre à éditer :', semestre);
    setSemesterToEdit(semestre);
    setOpenEditSemesterDialog(true);
  };

  const handleDeleteS = () => {
    if (selectedSemester) {
      setOpenConfirmDialog(true);
    } else {
      console.error('Aucun semestre sélectionné pour la suppression.');
    }
  };

  const confirmDelete = () => {
    if (selectedSemester) {
      semestreService
        .supprimerSemestre(selectedSemester.id)
        .then((response) => {
          // Suppression du semestre de l'état
          setSemestres((prevSemestres) =>
            prevSemestres.filter((semestre) => semestre.id !== selectedSemester.id)
          );
          console.log('Semester deleted');

          // Afficher le message de succès
          enqueueSnackbar(response, {
            variant: 'success',
            autoHideDuration: 5000,
          });

          handleMenuClose();
        })
        .catch((error) => {
          console.error('Error deleting semester:', error);

          // Afficher le message d'erreur du backend
          const errorMessage = error.response?.data || 'Erreur lors de la suppression du semestre';
          enqueueSnackbar(errorMessage, {
            variant: 'error',
            autoHideDuration: 5000,
          });
        });
    } else {
      console.error('Aucun semestre sélectionné pour la suppression.');
    }
    setOpenConfirmDialog(false);
  };
 


  const handleEditAnnee = async (id) => {
    if (!userPermissions.includes('UPDATE_ETAT_ANNEE')) {
      console.error("User does not have permission to update the state of the year.");
      return; // Exit the function if the user does not have permission
    }
  
    try {
      await anneeUniversitaireService.updateEtatAnneeUniversitaire(id);
      await fetchData();
    } catch (error) {
      console.error("Erreur lors du changement d'état de l'année universitaire :", error);
    }
  };

  const handleEditSemestre = async (id) => {
    if (!userPermissions.includes('UPDATE_ETAT_SEMESTRE')) {
      console.error("User does not have permission to update the state of the semester.");
      return; // Exit the function if the user does not have permission
    }
  
    try {
      // Mise à jour de l'état d'un semestre
      await semestreService.updateEtatSemestre(id, cursusSelectionne);
      // Récupérer ensuite la liste complète des semestres
      await fetchSemestres();
    } catch (error) {
      console.error("Erreur lors du changement d'état du semestre :", error);
    }
  };

 
  // const handleEditSemestre = async (id) => {
  //   try {
  //     const updatedSemestre = await semestreService.updateEtatSemestre(id);
  //     setSemestres((prevSemestres) =>
  //       prevSemestres.map((semestre) =>
  //         semestre.id === updatedSemestre.id ? updatedSemestre : semestre
  //       )
  //     );
      
  //   } catch (error) {
  //     console.error("Erreur lors du changement d'état du semestre :", error);
  //   }
  // };

  const handleAddAnnee = async () => {
    try {
      const debut = newAnnee.anneeDebut ? newAnnee.anneeDebut.getFullYear() : null;
      const fin = newAnnee.anneeFin ? newAnnee.anneeFin.getFullYear() : null;
      const anneeUniversitaireToAdd = {
        descriptionAnnee: newAnnee.descriptionAnnee,
        anneeDebut: debut,
        anneeFin: fin,
      };

      const response = await anneeUniversitaireService.ajouterAnneeUniversitaire(anneeUniversitaireToAdd);

     
      setNewAnnee({ descriptionAnnee: 'Année universitaire /', anneeDebut: null, anneeFin: null });
      enqueueSnackbar(response, {
        variant: 'success',
        autoHideDuration: 5000,
      });

      setOpenDialog(false);
      await fetchData();
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une année universitaire :", error);
      const errorMessage =
        error.response?.data || "Erreur lors de l'ajout de l'année universitaire.";
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Garde uniquement la partie date (YYYY-MM-DD)
  };
  

  const handleAddSemester = async () => {
    try {
      const cursusId = Number(cursusSelectionne);
      const anneeId = Number(anneeSelectionne);

      if (!cursusId || !anneeId) {
        throw new Error('Cursus ID ou Année ID manquant');
      }

      // Afficher les dates avant conversion
      console.log('Date de début avant conversion:', newSemester.dateDebut);
      console.log('Date de fin avant conversion:', newSemester.dateFin);

      // Créer des dates en utilisant UTC pour éviter le décalage
      const dateDebut = newSemester.dateDebut
        ? new Date(
            Date.UTC(
              newSemester.dateDebut.getFullYear(),
              newSemester.dateDebut.getMonth(),
              newSemester.dateDebut.getDate()
            )
          ).toISOString()
        : null;

      const dateFin = newSemester.dateFin
        ? new Date(
            Date.UTC(
              newSemester.dateFin.getFullYear(),
              newSemester.dateFin.getMonth(),
              newSemester.dateFin.getDate()
            )
          ).toISOString()
        : null;

      const semestreToAdd = {
        numSemestre: parseInt(newSemester.numSemestre, 10),
        nom: newSemester.nomSemestre,
        dateDebut,
        dateFin,
      };

      console.log('Semestre à ajouter:', JSON.stringify(semestreToAdd)); // Log pour débogage

      // Ajout du semestre
      const response = await semestreService.ajouterSemestre(semestreToAdd, cursusId, anneeId);

      // Mettre à jour l'état avec le nouveau semestre
      setSemestres((prevSemestres) => [
        ...prevSemestres,
        {
          ...semestreToAdd,
          id: response.id, // Supposons que le backend retourne un ID
          dateDebut: formatDate(semestreToAdd.dateDebut), // Reformater les dates
          dateFin: formatDate(semestreToAdd.dateFin), // Reformater les dates
        },
      ]);
      
      

      // Réinitialiser le formulaire
      setNewSemester({ numSemestre: '', nomSemestre: '', dateDebut: null, dateFin: null });
      setOpenSemesterDialog(false);

      enqueueSnackbar(response, {
        variant: 'success',
        autoHideDuration: 5000,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout d'un semestre :", error);

      // Afficher le message d'erreur du backend
      const errorMessage = error.response?.data
        ? error.response.data
        : "Erreur lors de l'ajout du semestre";

      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };
  const fetchJoursFeries = (anneeUniversitaireId) => {
    if (authLoading || !user) return;

    jourFerieService
      .getAllJoursFeries(anneeUniversitaireId)
      .then((data) => setJoursFeries(data))
      .catch((error) => console.error('Erreur lors du chargement des jours fériés :', error));
  };

  const fetchPeriodes = async () => {
    try {
      const data = await periodeEpService.getPeriodesBySemestreId(semestreSelectionne);
      setPeriodeEp(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des périodes:', error);
    }
  };
  
  // Utiliser useEffect pour récupérer les périodes lors du montage
  useEffect(() => {
    if (semestreSelectionne) { // Vérifier que semestreSelectionne est défini
      fetchPeriodes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semestreSelectionne]); // Dépendance à semestreSelectionne

  const handleSubmitAddJourFerrie = () => {
    if (!formData.nom || !formData.dateDebut || !formData.dateFin) {
      alert('Tous les champs sont requis.');
      return;
    }

    const anneeUniversitaireId = anneeSelectionne; // Ajustez selon vos IDs
    jourFerieService
      .ajouterJourFerie(anneeUniversitaireId, formData)
      .then((newJourFerie) => {
        setJoursFeries([...joursFeries, newJourFerie]);
        handleCloseModal();
      })
      .catch((error) => console.error('Erreur lors de l’ajout :', error));
  };

  useEffect(() => {
    const anneeUniversitaireId = anneeSelectionne;
    fetchJoursFeries(anneeUniversitaireId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anneeSelectionne]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenModal1 = () => setOpenModal(true);
  const handleCloseModal1 = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = async () => {
    try {
      const anneeUniversitaireId = anneeSelectionne;
  
      // Conversion des dates
      const dateDebut = formData.dateDebut
        ? new Date(
            Date.UTC(
              formData.dateDebut.getFullYear(),
              formData.dateDebut.getMonth(),
              formData.dateDebut.getDate()
            )
          ).toISOString()
        : null;
  
      const dateFin = formData.dateFin
        ? new Date(
            Date.UTC(
              formData.dateFin.getFullYear(),
              formData.dateFin.getMonth(),
              formData.dateFin.getDate()
            )
          ).toISOString()
        : null;
  
      const jourFerieToAdd = {
        nom: formData.nom,
        dateDebut,
        dateFin,
      };
  
      // Utilisation de async/await pour une meilleure gestion des erreurs
      const newJourFerie = await jourFerieService.ajouterJourFerie(anneeUniversitaireId, jourFerieToAdd);
      
      // Mise à jour de l'état avec le nouveau jour férié
      setJoursFeries([...joursFeries, newJourFerie]);
  
      // Afficher un message de succès
      enqueueSnackbar('Jour férié ajouté avec succès!', {
        variant: 'success',
        autoHideDuration: 5000,
      });
  
      // Réinitialiser le formulaire et fermer la modal
      handleCloseModal();
  
    } catch (error) {
      console.error('Erreur lors de l’ajout :', error);
      
      // Afficher le message d'erreur exact du backend
      enqueueSnackbar(error.message, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };
  

  const handleSubmitEp = async () => {
    try {
      const semestreSelectionneId = semestreSelectionne;
  
      // Validation des dates avant envoi
      if (formData.dateDebut && formData.dateFin && formData.dateFin < formData.dateDebut) {
        enqueueSnackbar('La date de fin doit être après la date de début', {
          variant: 'error',
          autoHideDuration: 5000,
        });
        return;
      }

      // Conversion des dates
      const dateDebut = formData.dateDebut
        ? new Date(
            Date.UTC(
              formData.dateDebut.getFullYear(),
              formData.dateDebut.getMonth(),
              formData.dateDebut.getDate()
            )
          ).toISOString()
        : null;
  
      const dateFin = formData.dateFin
        ? new Date(
            Date.UTC(
              formData.dateFin.getFullYear(),
              formData.dateFin.getMonth(),
              formData.dateFin.getDate()
            )
          ).toISOString()
        : null;
  
      const periodeToAdd = {
        nom: formData.nom,
        dateDebut,
        dateFin,
        type: formData.type
      };
  
      const response = await periodeEpService.addPeriode(periodeToAdd, semestreSelectionneId);
      fetchPeriodes();

      enqueueSnackbar(response.message || 'Période ajoutée avec succès!', {
        variant: 'success',
        autoHideDuration: 5000,
      });
  
      handleCloseModal();
  
    } catch (error) {
      console.error('Erreur lors de l\'ajout :', error);
      
      enqueueSnackbar(
        error.response?.data?.message 
          || error.message 
          || 'Erreur lors de l\'ajout de la période',
        {
          variant: 'error',
          autoHideDuration: 5000,
        }
      );
    }
};


  // eslint-disable-next-line arrow-body-style
  const isFormValidAnnee = () => {
    return (
        newAnnee.descriptionAnnee &&
        newAnnee.anneeDebut &&
        newAnnee.anneeFin
    );
};
// eslint-disable-next-line arrow-body-style
const isFormValidSemestre = () => {
  return (
      newSemester.numSemestre &&
      newSemester.nomSemestre &&
      newSemester.dateDebut &&
      newSemester.dateFin
  );
};
// eslint-disable-next-line arrow-body-style
const isFormValidVacance = () => {
  return (
      formData.nom &&
      formData.dateDebut &&
      formData.dateFin
  );
};
// eslint-disable-next-line arrow-body-style
const isFormValidPlage = () => {
  return (
      newPlage.codePlageHoraire &&
      newPlage.heureDebut &&
      newPlage.heureFin
  );
};

const handleMenuOpen0 = (event, jour) => {
    setAnchorEl0(event.currentTarget);
    setSelectedJour(jour);
  };

  const handleMenuOpen1 = (event, periode) => {
    setAnchorEl5(event.currentTarget);
    setSelectedPeriodeEp(periode);
  };

  const handleMenuOpen2 = (event, periode) => {
    setAnchorEl2(event.currentTarget);
    setSelectedPeriode(periode);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setAnchorEl2(null);
    setSelectedJour(null);
    setSelectedPeriode(null);
    setAnchorEl3(null);
    setAnchorEl4(null);
    setAnchorEl5(null);
    setSelectedPeriodeEp(null);


  };
  const handleDelete = () => {
    jourFerieService
      .deleteJourFerie(selectedJour.id)
      .then(() => {
        setJoursFeries(joursFeries.filter((jour) => jour.id !== selectedJour.id));
        handleMenuClose();
      })
      .catch((error) => console.error('Erreur lors de la suppression :', error));
  };

  const handleEdit = () => {
    console.log('Modifier le jour férié :', selectedJour);
    handleMenuClose();
  };

  const handleOpenDetails = () => {
    setOpenDetailsDialog(true);
    handleMenuClose();
  };

  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
  };

  const handleUpdateSemester = async () => {
    if (!semesterToEdit) return;

    try {
      const response = await semestreService.modifierSemestre(semesterToEdit.id, {
        numSemestre: semesterToEdit.numSemestre,
        nom: semesterToEdit.nom,
        dateDebut: semesterToEdit.dateDebut,
        dateFin: semesterToEdit.dateFin,
      });

      // Mettre à jour la liste des semestres
      setSemestres((prevSemestres) =>
        prevSemestres.map((semestre) =>
          semestre.id === semesterToEdit.id ? { ...semesterToEdit } : semestre
        )
      );

      setOpenEditSemesterDialog(false);

      // Afficher le message de succès
      enqueueSnackbar(response, {
        variant: 'success',
        autoHideDuration: 5000,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du semestre:', error);

      // Afficher le message d'erreur du backend
      const errorMessage = error.response?.data || 'Erreur lors de la mise à jour du semestre';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };

  const fetchSemestres = async () => {
    if (authLoading || !user) return;

    try {
      const data = await semestreService.listerSemestresParCursusEtAnnee(cursusSelectionne,anneeSelectionne);
      setSemestres(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des semestres:', error);
    }
  };
  useEffect(() => {
    fetchSemestres();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursusSelectionne,anneeSelectionne]);
  
  const handleAjouterPeriode = async () => {
    try {
      console.log('Adding period:', newPeriod, 'to semester ID:', selectedSemester.id);
  
      if (!newPeriod.nom || !newPeriod.dateDebut || !newPeriod.dateFin || !selectedSemester) {
        throw new Error('Veuillez remplir tous les champs requis.');
      }
  
      // Créer des dates en utilisant UTC
      const dateDebut = new Date(
        Date.UTC(
          newPeriod.dateDebut.getFullYear(),
          newPeriod.dateDebut.getMonth(),
          newPeriod.dateDebut.getDate()
        )
      ).toISOString();
  
      const dateFin = new Date(
        Date.UTC(
          newPeriod.dateFin.getFullYear(),
          newPeriod.dateFin.getMonth(),
          newPeriod.dateFin.getDate()
        )
      ).toISOString();
  
      const periodeToAdd = {
        numPeriode: newPeriod.numPeriode,
        nom: newPeriod.nom,
        dateDebut,
        dateFin,
      };
  
      const response = await semestreService.ajouterPeriode(selectedSemester.id, periodeToAdd);
      
      // Afficher le message de succès
      enqueueSnackbar(response.message, {
        variant: 'success',
        autoHideDuration: 5000,
      });
  
      // Met à jour la liste des semestres
      setSemestres(prevSemestres => 
        prevSemestres.map(semestre => 
          semestre.id === selectedSemester.id
            ? { ...semestre, periodes: [...semestre.periodes, response.data] }
            : semestre
        )
      );
  
      // Met à jour selectedSemester
      setSelectedSemester(prev => ({
        ...prev,
        periodes: [...prev.periodes, response.data]
      }));
  
      // Réinitialiser et fermer
      setNewPeriod({ numPeriode: '', nom: '', dateDebut: null, dateFin: null });
      setOpenAddPeriodDialog(false);
  
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la période:', error);
      
      // Afficher le message d'erreur exact
      enqueueSnackbar(error.message, {
        variant: 'error',
        autoHideDuration: 8000, // Plus long pour les erreurs
      });
    }
  };
  // Utiliser useEffect pour suivre les changements
  useEffect(() => {
    console.log('Selected semester after update:', selectedSemester);
  }, [selectedSemester]);
  const handleOpenAddPeriodDialog = () => {
    setOpenAddPeriodDialog(true);
  };
  // eslint-disable-next-line arrow-body-style
  const isFormValid = () => {
    return (
        formData.nom &&
        formData.dateDebut &&
        formData.dateFin
    );
};
  const handleCloseAddPeriodDialog = () => {
    setOpenAddPeriodDialog(false);
    setNewPeriod({ nom: '', numPeriode: '', dateDebut: null, dateFin: null }); // Reset form
  };

  // Fonction pour ouvrir le dialogue de modification de période
  const handleEditPeriod = (period) => {
    setPeriodToEdit(period);
    setOpenEditPeriodDialog(true);
  };

  const handleUpdatePeriod = async () => {
    if (!periodToEdit) return;
  
    const debutDate =
      periodToEdit.dateDebut instanceof Date
        ? periodToEdit.dateDebut.toISOString().split('T')[0]
        : null;
  
    const finDate =
      periodToEdit.dateFin instanceof Date
        ? periodToEdit.dateFin.toISOString().split('T')[0]
        : null;
  
    console.log('Mise à jour de la période avec les données suivantes :', {
      id: periodToEdit.id,
      nom: periodToEdit.nom,
      dateDebut: debutDate,
      dateFin: finDate,
    });
  
    try {
      const updatedPeriod = await semestreService.updatePeriode(
        periodToEdit.id,
        periodToEdit.nom,
        debutDate,
        finDate
      );
      console.log("Période mise à jour reçue de l'API :", updatedPeriod);
  
      // Afficher un message de succès
      enqueueSnackbar('Période mise à jour avec succès!', {
        variant: 'success',
        autoHideDuration: 5000,
      });
  
      // Met à jour la liste des semestres
      setSemestres((prevSemestres) => {
        const updatedSemestres = prevSemestres.map((semestre) => {
          // Vérifie si le semestre contient la période à mettre à jour
          if (semestre.periodes.some((periode) => periode.id === updatedPeriod.id)) {
            return {
              ...semestre,
              periodes: semestre.periodes.map((periode) =>
                periode.id === updatedPeriod.id ? updatedPeriod : periode
              ),
            };
          }
          return semestre;
        });
  
        console.log('Semestres mis à jour :', updatedSemestres);
        return updatedSemestres;
      });
  
      // Mettre à jour selectedSemester si c'est le semestre actuellement affiché
      if (selectedSemester && selectedSemester.periodes.some((p) => p.id === updatedPeriod.id)) {
        setSelectedSemester((prev) => ({
          ...prev,
          periodes: prev.periodes.map((p) => (p.id === updatedPeriod.id ? updatedPeriod : p)),
        }));
      }
  
      setOpenEditPeriodDialog(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la période :', error);
  
      // Afficher le message d'erreur exact du backend via Snackbar
      enqueueSnackbar(error.message, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog2(false);
  };
  const handleDeletePeriod = (periode) => {
    setSelectedPeriode(periode);
    setOpenConfirmDialog2(true);
  };

  const confirmDelete1 = () => {
    semestreService
      .supprimerPeriode(selectedPeriod.id)
      .then(() => {
        // Mise à jour de l'état pour supprimer la période dans le semestre sélectionné
        setSelectedSemester((prev) => ({
          ...prev,
          periodes: prev.periodes.filter((periode) => periode.id !== selectedPeriod.id),
        }));

        // Mise à jour de l'état pour supprimer la période dans la liste des semestres
        setSemestres((prevSemestres) =>
          prevSemestres.map((semestre) =>
            semestre.id === selectedSemester.id
              ? {
                  ...semestre,
                  periodes: semestre.periodes.filter((periode) => periode.id !== selectedPeriod.id),
                }
              : semestre
          )
        );

        // Afficher un message de succès
        enqueueSnackbar('Période supprimée avec succès.', {
          variant: 'success',
          autoHideDuration: 5000,
        });

        setOpenConfirmDialog2(false); // Fermer la boîte de dialogue de confirmation
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression de la période :', error);

        // Afficher le message d'erreur via Snackbar
        enqueueSnackbar(error.response?.data || 'Erreur lors de la suppression.', {
          variant: 'error',
          autoHideDuration: 5000,
        });
      });
  };



  const handleOpenModalEdit = () => {
    setOpenModalEdit(true);
  };
  
  
  const handleOpenModalEdit1 = (periode) => {
    setOpenModalEdit(true);

    setSelectedPeriodeEp(periode); // Assurez-vous que la période est définie ici
    // Ouvrir le modal
  };
  
  
  const handleCloseModalEdit = () => {
    setOpenModalEdit(false);
    setFormData1({
      nom: '',
      dateDebut: null,
      dateFin: null,
      type: '',
    }); // Réinitialise le formulaire
  };
  

 
  const handleSelectPeriode = (periode) => {
    setSelectedPeriodeEp(periode);
    setFormData1({
      nom: periode.nom,
      
    dateDebut: new Date(periode.dateDebut),
    dateFin: new Date(periode.dateFin),
      type: periode.type
    });
  };

  const handleDeletePeriode = async () => {
    if (!selectedPeriodeEp?.id) {
        enqueueSnackbar('Aucune période sélectionnée pour la suppression', {
            variant: 'error',
            autoHideDuration: 5000,
        });
        return;
    }

    try {
        const response = await periodeEpService.deletePeriode(selectedPeriodeEp.id);
        fetchPeriodes();
        
        enqueueSnackbar(response?.message || 'Période supprimée avec succès', {
            variant: 'success',
            autoHideDuration: 5000,
        });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        enqueueSnackbar(
            error.response?.data?.message 
              || error.message 
              || 'Erreur lors de la suppression de la période',
            {
                variant: 'error',
                autoHideDuration: 5000,
            }
        );
    }
    
    handleCloseConfirmDialogPeriode();
};

  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setFormData1(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitEdit = async () => {
    if (!selectedPeriodeEp) {
        enqueueSnackbar('Aucune période sélectionnée pour la mise à jour', {
            variant: 'error',
            autoHideDuration: 5000,
        });
        return;
    }

    try {
        // Validation des dates avant envoi
        if (formData1.dateDebut && formData1.dateFin && formData1.dateFin < formData1.dateDebut) {
            enqueueSnackbar('La date de fin doit être après la date de début', {
                variant: 'error',
                autoHideDuration: 5000,
            });
            return;
        }

        const updatedPeriode = {
            nom: formData1.nom,
            dateDebut: formData1.dateDebut?.toISOString(),
            dateFin: formData1.dateFin?.toISOString(),
            type: formData1.type,
        };

        const response = await periodeEpService.updatePeriode(
            selectedPeriodeEp.id, 
            semestreSelectionne, 
            updatedPeriode
        );

        fetchPeriodes();
        
        enqueueSnackbar(response.message || 'Période mise à jour avec succès!', {
            variant: 'success',
            autoHideDuration: 5000,
        });

        handleCloseModalEdit();
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        enqueueSnackbar(
            error.response?.data?.message 
              || error.message 
              || 'Erreur lors de la mise à jour de la période',
            {
                variant: 'error',
                autoHideDuration: 5000,
            }
        );
    }
};
  return (
    <Drawer
      anchor="right"
      open={settings.open}
      onClose={settings.onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({ theme, bgcolor: theme.palette.background.default }),
          width: 700,
        },
      }}
    >
      {renderHead}

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {/* {renderMode}

          {renderContrast}

          {renderDirection}

          {renderLayout} */}

          {/* {renderStretch}

          {renderPresets} */}

<Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        
      {userPermissions.includes('VIEW_JOUR_FERIE') && (

        <Accordion sx={{ backgroundColor: '#f5f5f5' }}>
        <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">Jour Férié</Typography>
          </AccordionSummary>
          <AccordionDetails >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Liste des Jours Fériés</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Année</InputLabel>
                  <Select value={anneeSelectionne} onChange={handleAnneeChange} label="Année">
                    {anneesUniversitaires.map((annee) => (
                      <MenuItem key={annee.id} value={annee.id}>
                        {annee.descriptionAnnee}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
               {userPermissions.includes('CREATE_JOUR_FERIE') && (
  <Button
    variant="contained"
    startIcon={<Iconify icon="ic:baseline-add" />}
    onClick={handleOpenModal}
  >
    Ajouter Jour Férié
  </Button>
)}
              </Box>
            </Box>

            <Paper variant="outlined" sx={{ width: '100%', backgroundColor: '#ffffff' }}>
              {joursFeries && joursFeries.length > 0 ? (
                <List>
                  {joursFeries.map((jour) => (
                    <ListItemButton key={jour.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Iconify icon="ic:round-calendar-today" width={24} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={jour.nom}
                        secondary={
                          jour.dateDebut === jour.dateFin
                            ? jour.dateDebut
                            : `${jour.dateDebut} - ${jour.dateFin}`
                        }
                      />
                     {userPermissions.includes('DELETE_JOUR_FERIE') && (
    <>
      <IconButton onClick={(e) => handleMenuOpen0(e, jour)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
      <Menu
        anchorEl={anchorEl0}
        open={Boolean(anchorEl0) && selectedJour?.id === jour.id}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleOpenConfirmDialogJour(selectedJour);
            handleMenuClose();
          }}
          sx={{ color: 'red' }}
        >
          Supprimer
        </MenuItem>
      </Menu>
    </>
  )}
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Typography align="center" sx={{ p: 2 }}>
                  Aucun jour férié disponible.
                </Typography>
              )}
            </Paper>
          </AccordionDetails>
        </Accordion>
        )}




        {/* Années Universitaires Accordion */}
        <Accordion  sx={{ backgroundColor: '#f5f5f5' }}>
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">Années Universitaires</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                mb: 2,
              }}
            >
              <Typography variant="h6">Liste des Années Universitaires</Typography>
              {userPermissions.includes('CREATE_ANNEE') && (
  <Button
    variant="contained"
    startIcon={<Iconify icon="ic:baseline-add" />}
    onClick={() => setOpenDialog(true)}
  >
    Ajouter une Année Universitaire
  </Button>
)}
            </Box>
            <Paper variant="outlined" sx={{ width: 1 }}>
              <List>
                {Array.isArray(anneesUniversitaires) &&
                  anneesUniversitaires
                    .sort((a, b) => a.anneeDebut - b.anneeDebut)
                    .map((annee) => (
                      <ListItemButton key={annee.id}>
                        <ListItemText
                          primary={annee.descriptionAnnee}
                          secondary={`${annee.anneeDebut} - ${annee.anneeFin}`}
                        />
                       {userPermissions.includes('UPDATE_ETAT_ANNEE') ? (
  <Switch
    checked={annee.etatAnnee}
    onChange={() => handleEditAnnee(annee.id)}
  />
) : (
  <Label
    variant="soft"
    color={annee.etatAnnee ? 'success' : 'error'}
    sx={{ ml: 1 }}
  >
    {annee.etatAnnee ? 'Active' : 'Inactive'}
  </Label>
)}
                      </ListItemButton>
                    ))}
              </List>
            </Paper>
          </AccordionDetails>
        </Accordion>


        
        <Accordion  sx={{ backgroundColor: '#f5f5f5' }}>
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">Les Semestres</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: { xs: 2, sm: 0 } }}>
                Liste des Semestres
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                {/* <FormControl variant="outlined" size="small" sx={{ minWidth: 120, flex: 1 }}>
                  <InputLabel>Cursus</InputLabel>
                  <Select value={cursusSelectionne} onChange={handleCursusChange} label="Cursus">
                    {cursusList.map((cursus) => (
                      <MenuItem key={cursus.id} value={cursus.id}>
                        {cursus.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                {/* <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Année</InputLabel>
                  <Select value={anneeSelectionne} onChange={handleAnneeChange} label="Année">
                    {anneesUniversitaires.map((annee) => (
                      <MenuItem key={annee.id} value={annee.id}>
                        {annee.descriptionAnnee}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
               {userPermissions.includes('CREATE_SEMESTRE') && (
  <Button
    variant="contained"
    startIcon={<Iconify icon="ic:baseline-add" />}
    onClick={() => setOpenSemesterDialog(true)}
    sx={{ flexShrink: 0 }}
  >
    Ajouter un Semestre
  </Button>
)}
              </Box>
            </Box>

            <Paper variant="outlined" sx={{ width: '100%', overflow: 'auto' }}>
              <List>
                {semestres.length === 0 ? (
                  <Typography align="center" sx={{ p: 2 }}>
                    Aucun semestre disponible.
                  </Typography>
                ) : (
                  semestres.map((semestre) => (
                    <ListItem key={semestre.id} sx={{ display: 'block' }}>
                       <ListItemButton onClick={() => handleAccordionChange(semestre.id)}  >
                        <ListItemText
                          primary={`Semestre ${semestre.numSemestre}`}
                          secondary={`${semestre.dateDebut} / ${semestre.dateFin}`}
                        />
                        {userPermissions.includes('UPDATE_ETAT_SEMESTRE') ? (
  <Switch
    checked={semestre.etatSemestre}
    onChange={() => handleEditSemestre(semestre.id)}
  />
) : (
  <Label
    variant="soft"
    color={semestre.etatSemestre ? 'success' : 'error'}
    sx={{ ml: 1 }}
  >
    {semestre.etatSemestre ? 'Active' : 'Inactive'}
  </Label>
)}
                       {userPermissions.includes('DELETE_SEMESTRE') ||
 userPermissions.includes('CREATE_PERIODE') ||
 userPermissions.includes('UPDATE_SEMESTRE') ? (
  <IconButton onClick={(event) => handleMenuClick(event, semestre)}>
    <Iconify icon="eva:more-vertical-fill" />
  </IconButton>
) : null}
                      </ListItemButton>

                      {/* Affiche les périodes si le semestre est ouvert */}
                      {openAccordion === semestre.id && (
                        <Box sx={{ pl: 4, mt: 1 }}>
                          {semestre.periodes.map((periode) => (
                            <Typography
                              key={periode.id}
                              variant="body2"
                              sx={{ mb: 1, fontSize: '0.800rem' }}
                            >
                              <strong>{periode.nom} :</strong> {periode.dateDebut} /{' '}
                              {periode.dateFin}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>

            {/* Menu pour actions supplémentaires sur le semestre */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {userPermissions.includes('CREATE_PERIODE') && (
  <MenuItem onClick={handleOpenDetails}>
    <ListItemIcon>
      <Iconify icon="eva:info-fill" />
    </ListItemIcon>
    Détails
  </MenuItem>
)}
              {userPermissions.includes('UPDATE_SEMESTRE') && (
  <MenuItem
    onClick={() => {
      handleEditS(selectedSemester);
      handleMenuClose();
    }}
  >
    <ListItemIcon>
      <Iconify icon="eva:edit-fill" />
    </ListItemIcon>
    Modifier
  </MenuItem>
)}
            {userPermissions.includes('DELETE_SEMESTRE') && (
  <MenuItem onClick={handleDeleteS}>
    <ListItemIcon>
      <Iconify icon="eva:trash-2-outline" />
    </ListItemIcon>
    Supprimer
  </MenuItem>
)}
            </Menu>
          </AccordionDetails>
        </Accordion>
        <Accordion  sx={{ backgroundColor: '#f5f5f5' }} >
        <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">Vacances</Typography>
          </AccordionSummary>
          <AccordionDetails >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Liste des Vacances</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Cursus</InputLabel>
                  <Select value={cursusSelectionne} onChange={handleCursusChange} label="Cursus">
                    {cursusList.map((cursus) => (
                      <MenuItem key={cursus.id} value={cursus.id}>
                        {cursus.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                {userPermissions.includes('CREATE_VACANCE') && (
  <Button
    variant="contained"
    startIcon={<Iconify icon="ic:baseline-add" />}
    onClick={handleOpenModalVacances}
  >
    Ajouter Vacance
  </Button>
)}
              </Box>
            </Box>

            <Paper variant="outlined" sx={{ width: '100%', backgroundColor: '#ffffff' }}>
              {vacances && vacances.length > 0 ? (
                <List>
                  {vacances.map((vacance) => (
                    <ListItemButton key={vacance.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Iconify icon="ic:round-calendar-today" width={24} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={vacance.nom}
                        secondary={`${vacance.dateDebut} - ${vacance.dateFin}`}
                      />
 {userPermissions.includes('UPDATE_VACANCE') || userPermissions.includes('DELETE_VACANCE') ? (
  <IconButton onClick={(e) => handleMenuOpenVac(e, vacance)}>
    <Iconify icon="eva:more-vertical-fill" />
  </IconButton>
) : null}
                  <Menu
  anchorEl={anchorElVac}
  open={Boolean(anchorElVac) && selectedVacance?.id === vacance.id}
  onClose={handleMenuCloseVac}
>
  {userPermissions.includes('UPDATE_VACANCE') && (
    <MenuItem onClick={() => handleOpenModalUpdateVacance(vacance)}>
      Modifier
    </MenuItem>
  )}
  
  {userPermissions.includes('DELETE_VACANCE') && (
    <MenuItem
      onClick={() => {
        handleOpenConfirmDialogVacance(vacance);
        handleMenuCloseVac();
      }}
      sx={{ color: 'red' }}
    >
      Supprimer
    </MenuItem>
  )}
</Menu>



                      
                    </ListItemButton>
                    
                  ))}
                </List>
              ) : (
                <Typography align="center" sx={{ p: 2 }}>
                  Aucune vacance disponible.
                </Typography>
              )}
            </Paper>
          </AccordionDetails>
        </Accordion>
        <Accordion  sx={{ backgroundColor: '#f5f5f5' }}>
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">Les Plages Horaires</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: { xs: 2, sm: 0 } }}>
                Liste des Plages Horaires
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                {/* <FormControl variant="outlined" size="small" sx={{ minWidth: 120, flex: 1 }}>
                  <InputLabel>Cursus</InputLabel>
                  <Select value={cursusSelectionne} onChange={handleCursusChange} label="Cursus">
                    {cursusList.map((cursus) => (
                      <MenuItem key={cursus.id} value={cursus.id}>
                        {cursus.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                {userPermissions.includes('CREATE_PLAGE_HORAIRE') && (
  <Button
    variant="contained"
    startIcon={<Iconify icon="ic:baseline-add" />}
    onClick={handleOpenAddPlageDialog}
    sx={{ flexShrink: 0 }}
  >
    Ajouter une Plage Horaire
  </Button>
)}
              </Box>
            </Box>

            <Paper variant="outlined" sx={{ width: '100%', overflow: 'auto' }}>
              <List>
                {plagesHoraires.length === 0 ? (
                  <Typography align="center" sx={{ p: 2 }}>
                    Aucune plage horaire disponible.
                  </Typography>
                ) : (
                  plagesHoraires.map((plage) => (
                    <ListItem key={plage.id}>
                      <ListItemButton onClick={() => handleAccordionChange(plage.id)}>
                        <ListItemText
                          primary={plage.codePlageHoraire}
                          secondary={`${plage.heureDebut} à ${plage.heureFin}`}
                        />
                      {userPermissions.includes('UPDATE_ETAT_PLAGE_HORAIRE') ? (
  <Switch
    checked={plage.actif}
    onChange={() => handleChangeEtatPlageHoraire(plage.id)}
  />
) : (
  <Label
    variant="soft"
    color={plage.actif ? 'success' : 'error'}
    sx={{ ml: 1 }}
  >
    {plage.actif ? 'Active' : 'Inactive'}
  </Label>
)}
                        {userPermissions.includes('UPDATE_PLAGE_HORAIRE') && userPermissions.includes('DELETE_PLAGE_HORAIRE') && (
  <IconButton onClick={(event) => handleMenuClick1(event, plage)}>
    <Iconify icon="eva:more-vertical-fill" />
  </IconButton>
)}
                      </ListItemButton>
                      <Menu
                        anchorEl={anchorEl4}
                        open={Boolean(anchorEl4)}
                        onClose={() => setAnchorEl4(null)}
                      >
                         {userPermissions.includes('UPDATE_PLAGE_HORAIRE') && (
    <MenuItem
      onClick={() => {
        console.log(plage);
        setSelectedPlageId(plage.id);
        handleOpenEditPlageDialog(plage);
        handleMenuClose();
      }}
    >
      <Iconify icon="eva:edit-fill" /> Modifier
    </MenuItem>
  )}

  {userPermissions.includes('DELETE_PLAGE_HORAIRE') && (
    <MenuItem
      onClick={() => {
        setSelectedPlageId(plage.id);
        handleDeletePlageHoraire(); // Appelle la fonction pour gérer la suppression
        handleMenuClose(); // Ferme le menu après la sélection
      }}
    >
      <Iconify icon="eva:trash-2-outline" /> Supprimer
    </MenuItem>
  )}
                      </Menu>
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </AccordionDetails>
        </Accordion>



        <Dialog open={openEditPlageDialog} onClose={() => setOpenEditPlageDialog(false)}>
          <DialogTitle>Modifier une Plage Horaire</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Code Plage Horaire"
                value={editedPlage.codePlageHoraire}
                onChange={(e) =>
                  setEditedPlage({ ...editedPlage, codePlageHoraire: e.target.value })
                }
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TimePicker
                  label="Heure Début"
                  value={editedPlage.heureDebut}
                  onChange={handleHeureDebutChangeUpdate}
                  ampm={false}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <TimePicker
                  label="Heure Fin"
                  value={editedPlage.heureFin}
                  onChange={handleHeureFinChangeUpdate}
                  ampm={false}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
              <TextField
  label="Durée (heures)"
  value={editedPlage.duree !== null ? editedPlage.duree : ''}
  onChange={(e) => {
    const {value} = e.target;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setEditedPlage({ 
        ...editedPlage, 
        duree: value === '' ? null : parseFloat(value) 
      });
    }
  }}
  fullWidth
/>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleUpdatePlageHoraire}
              sx={{ backgroundColor: 'lightgray', color: 'black' }}
            >
              Modifier
            </Button>
            <Button
              onClick={() => setOpenEditPlageDialog(false)}
              sx={{ backgroundColor: 'lightgray', color: 'black' }}
            >
              Annuler
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openConfirmDialog1} onClose={() => setOpenConfirmDialog1(false)}>
          <DialogTitle>Confirmer la Suppression</DialogTitle>
          <DialogContent>
            <Typography>Êtes-vous sûr de vouloir supprimer cette plage horaire ?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog1(false)}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDeletePlage}
              variant="contained"
              style={{ backgroundColor: 'red', color: 'white' }}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openAddPlageDialog} onClose={handleCloseAddPlageDialog}>
          <DialogTitle>Ajouter une Plage Horaire</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Code Plage Horaire"
                value={newPlage.codePlageHoraire}
                onChange={(e) => setNewPlage({ ...newPlage, codePlageHoraire: e.target.value })}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TimePicker
                  label="Heure Début"
                  value={newPlage.heureDebut}
                  onChange={handleHeureDebutChange}
                  ampm={false} // Désactive le format AM/PM
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <TimePicker
                  label="Heure Fin"
                  value={newPlage.heureFin}
                  onChange={handleHeureFinChange}
                  ampm={false} // Désactive le format AM/PM
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
              <TextField
  label="Durée (heures)"
  value={newPlage.duree || ''}
  onChange={(e) => {
    const {value} = e.target;
    // Validation pour n'accepter que des nombres
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNewPlage({ 
        ...newPlage, 
        duree: value === '' ? null : parseFloat(value) 
      });
    }
  }}
  fullWidth
/>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleAjouterPlageHoraire}
              sx={{ backgroundColor: 'lightgray', color: 'black' }}
              disabled={!isFormValidPlage()} 
            >
              Ajouter
            </Button>
            <Button
              onClick={handleCloseAddPlageDialog}
              sx={{ backgroundColor: 'lightgray', color: 'black' }}
            >
              Annuler
            </Button>
          </DialogActions>
        </Dialog>



{/* Modal for Adding Vacance */}
<Modal open={openModalVacance} onClose={handleCloseModalVacances}>
  <Box sx={{ p: 4, width: 500, margin: 'auto', mt: '10%', backgroundColor: 'white', borderRadius: 1, boxShadow: 24 }}>
    <Typography variant="h6" component="h2" gutterBottom>
      Ajouter une Vacance
    </Typography>

    <TextField
      required
      label="Nom"
      name="nom"
      fullWidth
      margin="normal"
      value={formData.nom}
      onChange={handleChange}
    />

    <Grid container spacing={2} sx={{ mt: 1 }}> {/* Ajout d'espacement en haut */}
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Début"
          value={formData.dateDebut}
          onChange={(newValue) => setFormData({ ...formData, dateDebut: newValue })}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
        />
      </Grid>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Fin"
          value={formData.dateFin}
          onChange={(newValue) => setFormData({ ...formData, dateFin: newValue })}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
        />
      </Grid>
    </Grid>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
      <Button
        onClick={handleCloseModalVacances}
        sx={{ backgroundColor: 'lightgray', color: 'black', marginRight: 1 }} // Espacement très petit
      >
        Annuler
      </Button>
      <Button
        onClick={handleSubmitAddVacance}
        sx={{ backgroundColor: 'lightgray', color: 'black' }}
        disabled={!isFormValidVacance()}
      >
        Ajouter
      </Button>
    </Box>
  </Box>
</Modal>
{/* Modal for Updating Vacance */}
<Modal open={openModalUpdateVacance} onClose={handleCloseModalUpdateVacance}>
  <Box
    sx={{
      p: 4,
      width: 500, // Ajustez la largeur si nécessaire
      margin: 'auto',
      mt: '10%',
      backgroundColor: 'white',
      borderRadius: 1,
      boxShadow: 24,
    }}
  >
    <Typography variant="h6" component="h2" gutterBottom>
      Modifier une Vacance
    </Typography>
    
    <TextField
      required
      label="Nom"
      name="nom"
      fullWidth
      margin="normal"
      value={updateFormData.nom}
      onChange={(e) =>
        setUpdateFormData({ ...updateFormData, nom: e.target.value })
      }
    />

    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Début"
          value={updateFormData.dateDebut}
          onChange={(newValue) =>
            setUpdateFormData({ ...updateFormData, dateDebut: newValue })
          }
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" required />
          )}
        />
      </Grid>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Fin"
          value={updateFormData.dateFin}
          onChange={(newValue) =>
            setUpdateFormData({ ...updateFormData, dateFin: newValue })
          }
          renderInput={(params) => (
            <TextField {...params} fullWidth margin="normal" required />
          )}
        />
      </Grid>
    </Grid>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
      <Button
        onClick={handleCloseModalUpdateVacance}
        sx={{ backgroundColor: 'lightgray', color: 'black', marginRight: 1 }} // Espacement très petit
      >
        Annuler
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleConfirmUpdateVacance}
        sx={{ backgroundColor: 'lightgray', color: 'black' }}
      >
        Enregistrer
      </Button>
    </Box>
  </Box>
</Modal>



        <Dialog open={openDetailsDialog} onClose={handleCloseDetails}>
          <DialogTitle>Détails du Semestre</DialogTitle>
          <DialogContent>
            {selectedSemester && (
              <Box>
                <Typography variant="h6">{`Semestre ${selectedSemester.numSemestre}`}</Typography>
                <Typography>{`${selectedSemester.dateDebut} / ${selectedSemester.dateFin}`}</Typography>

                <Box sx={{ mt: 2 }}>
                  {selectedSemester.periodes.map((periode) => (
                    <Box
                      key={periode.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2">
                        <strong>{periode.nom} :</strong> {periode.dateDebut} / {periode.dateFin}
                      </Typography>
                      <IconButton onClick={(event) => handleMenuOpen2(event, periode)}>
                        <MoreHorizIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
          {userPermissions.includes('CREATE_PERIODE') && (
  <Button
    onClick={handleOpenAddPeriodDialog}
    sx={{ backgroundColor: 'lightgray', color: 'black' }}
  >
    Ajouter une Période
  </Button>
)}
            <Button
              onClick={handleCloseDetails}
              sx={{ backgroundColor: 'lightgray', color: 'black' }}
            >
              Fermer
            </Button>
          </DialogActions>

          <Menu anchorEl={anchorEl2} open={Boolean(anchorEl2)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                handleEditPeriod(selectedPeriod);
                handleMenuClose();
              }}
            >
              Modifier
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose(); // Fermer le menu
                handleDeletePeriod(selectedPeriod); // Supprimer après
              }}
            >
              Supprimer
            </MenuItem>
          </Menu>
        </Dialog>

        <Dialog open={openConfirmDialog2} onClose={() => setOpenConfirmDialog2(false)}>
          <DialogTitle>Confirmer la Suppression</DialogTitle>
          <DialogContent>
            <Typography>Êtes-vous sûr de vouloir supprimer cette période ?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog2(false)}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete1}
              variant="contained"
              style={{ backgroundColor: 'red', color: 'white' }}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openEditPeriodDialog} onClose={() => setOpenEditPeriodDialog(false)}>
          <DialogTitle>Modifier la Période</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nom de Période"
                value={periodToEdit ? periodToEdit.nom : ''}
                onChange={(e) => setPeriodToEdit({ ...periodToEdit, nom: e.target.value })}
                fullWidth
                margin="normal"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Date Début"
                  value={periodToEdit?.dateDebut ? new Date(periodToEdit.dateDebut) : null}
                  onChange={(newValue) => setPeriodToEdit({ ...periodToEdit, dateDebut: newValue })}
                />
                <DatePicker
                  label="Date Fin"
                  value={periodToEdit?.dateFin ? new Date(periodToEdit.dateFin) : null}
                  onChange={(newValue) => setPeriodToEdit({ ...periodToEdit, dateFin: newValue })}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditPeriodDialog(false)}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
            >
              Annuler
            </Button>
            <Button onClick={handleUpdatePeriod} variant="contained">
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar pour afficher le message de confirmation */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          // onClose={handleSnackbarClose}
          message={confirmationMessage}
        />

        <Dialog open={openAddPeriodDialog} onClose={handleCloseAddPeriodDialog}>
          <DialogTitle>Ajouter une Période</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Numéro de la Période"
                  type="number"
                  value={newPeriod.numPeriode || ''}
                  onChange={(e) => setNewPeriod({ ...newPeriod, numPeriode: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Nom de la Période"
                  value={newPeriod.nom}
                  onChange={(e) => setNewPeriod({ ...newPeriod, nom: e.target.value })}
                  fullWidth
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Date Début"
                  value={newPeriod.dateDebut}
                  onChange={(newValue) => setNewPeriod({ ...newPeriod, dateDebut: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                    },
                  }}
                />
                <DatePicker
                  label="Date Fin"
                  value={newPeriod.dateFin}
                  onChange={(newValue) => setNewPeriod({ ...newPeriod, dateFin: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                    },
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleAjouterPeriode}
              sx={{ backgroundColor: 'lightgray', color: 'black' }}
            >
              Ajouter
            </Button>
            <Button
              onClick={handleCloseAddPeriodDialog}
              sx={{ backgroundColor: 'lightgray', color: 'black' }}
            >
              Annuler
            </Button>
          </DialogActions>
        </Dialog>
        {/* Modal pour ajouter un jour férié */}
        <Modal open={openModal} onClose={handleCloseModal}>
  <Box sx={style}>
    <Typography variant="h6" component="h2" gutterBottom>
      Ajouter un Jour Férié
    </Typography>

    {/* Formulaire Ajusté */}
    <TextField
      required
      label="Nom"
      name="nom"
      fullWidth
      margin="normal"
      value={formData.nom}
      onChange={handleChange}
      sx={{ marginBottom: 2 }}
    />

    <Grid container spacing={2}>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Début"
          value={formData.dateDebut}
          onChange={(newValue) => setFormData({ ...formData, dateDebut: newValue })}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          inputFormat="dd/MM/yyyy"
        />
      </Grid>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Fin"
          value={formData.dateFin}
          onChange={(newValue) => setFormData({ ...formData, dateFin: newValue })}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          inputFormat="dd/MM/yyyy"
        />
      </Grid>
    </Grid>

    <DialogActions>
      <Button
        onClick={handleCloseModal}
        style={{ color: 'black' }} // Couleur du texte en noir
      >
        Annuler
      </Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        disabled={!isFormValid()}
      >
        Ajouter
      </Button>
    </DialogActions>
  </Box>
</Modal>

        {/* Dialog pour ajouter une année universitaire */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Ajouter une Année Universitaire</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Description de l'Année"
                value={newAnnee.descriptionAnnee}
                onChange={(e) => setNewAnnee({ ...newAnnee, descriptionAnnee: e.target.value })}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                  style: {
                    fontSize: '16px',
                    color: 'grey',
                    fontWeight: 'bold',
                  },
                }}
              />
              <DatePicker
                views={['year']}
                label="Année Début"
                value={newAnnee.anneeDebut}
                onChange={(newValue) => {
                  const newFin = newValue ? new Date(newValue.getFullYear() + 1, 0, 1) : null;
                  setNewAnnee({
                    ...newAnnee,
                    anneeDebut: newValue,
                    anneeFin: newFin,
                    descriptionAnnee: `Année universitaire ${
                      newValue ? newValue.getFullYear() : ''
                    } / ${newFin ? newFin.getFullYear() : ''}`,
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                  },
                }}
              />
              <DatePicker
                views={['year']}
                label="Année Fin"
                value={newAnnee.anneeFin}
                onChange={(newValue) => {
                  setNewAnnee((prev) => ({
                    ...prev,
                    anneeFin: newValue,
                    descriptionAnnee: `Année universitaire ${
                      prev.anneeDebut ? prev.anneeDebut.getFullYear() : ''
                    } / ${newValue ? newValue.getFullYear() : ''}`,
                  }));
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
color="secondary">
              Annuler
            </Button>
            <Button onClick={handleAddAnnee} variant="contained" 
            disabled={!isFormValidAnnee()}>
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>


        <Accordion sx={{ backgroundColor: '#f5f5f5' }}>
  <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
    <Typography variant="subtitle1">Période d&apos;épreuve</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Box
      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
    >
      <Typography variant="h6">Liste des Périodes d&apos;épreuve</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {userPermissions.includes('CREATE_JOUR_FERIE') && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="ic:baseline-add" />}
            onClick={handleOpenModal1}
          >
            Ajouter Période Epreuve
          </Button>
        )}
      </Box>
    </Box>

    <Paper variant="outlined" sx={{ width: '100%', backgroundColor: '#ffffff' }}>
      {periodeEp && periodeEp.length > 0 ? (
        <List>
          {periodeEp.map((periode) => (
            <ListItemButton key={periode.id} onClick={() => handleSelectPeriode(periode)}>
              <ListItemAvatar>
                <Avatar>
                  <Iconify icon="ic:round-calendar-today" width={24} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={periode.nom}
                secondary={
                  periode.dateDebut === periode.dateFin
                    ? periode.dateDebut
                    : `${periode.dateDebut} - ${periode.dateFin}`
                }
              />
              <IconButton onClick={(e) => handleMenuOpen1(e, periode)}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
              <Menu
                anchorEl={anchorEl5}
                open={Boolean(anchorEl5) && selectedPeriodeEp?.id === periode.id}
                onClose={handleMenuClose}
              >
                  <MenuItem
                  onClick={() => {
                    setFormData({
                      nom: periode.nom,
                      dateDebut: periode.dateDebut,
                      dateFin: periode.dateFin,
                      type: periode.type,
                    });
                    handleOpenModalEdit1(); // Ouvre le modal de modification
                    handleMenuClose();
                  }}
                >
                  Modifier
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOpenConfirmDialogPeriode(selectedPeriodeEp);
                    handleMenuClose();
                  }}
                  sx={{ color: 'red' }}
                >
                  Supprimer
                </MenuItem>
              
              </Menu>
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Typography align="center" sx={{ p: 2 }}>
          Aucun période d&apos;épreuve
        </Typography>
      )}
    </Paper>
  </AccordionDetails>
</Accordion>

{/* Modal pour ajouter période d'épreuve */}
<Modal open={openModal} onClose={handleCloseModal1}>
  <Box sx={style}>
    <Typography variant="h6" component="h2" gutterBottom>
      Ajouter Epreuve
    </Typography>
    {/* Formulaire Ajusté */}
    <TextField
      required
      label="Nom"
      name="nom"
      fullWidth
      margin="normal"
      value={formData.nom}
      onChange={handleChange}
      sx={{ marginBottom: 2 }}
    />
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Début"
          value={formData.dateDebut}
          onChange={(newValue) => setFormData({ ...formData, dateDebut: newValue })}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          inputFormat="dd/MM/yyyy"
        />
      </Grid>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Fin"
          value={formData.dateFin}
          onChange={(newValue) => setFormData({ ...formData, dateFin: newValue })}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          inputFormat="dd/MM/yyyy"
        />
      </Grid>
    </Grid>
    <TextField
      required
      label="Type"
      name="type"
      fullWidth
      margin="normal"
      value={formData.type}
      onChange={handleChange}
      sx={{ marginBottom: 2 }}
    />
    <DialogActions>
      <Button onClick={handleCloseModal1} style={{ color: 'black' }}>
        Annuler
      </Button>
      <Button onClick={handleSubmitEp} variant="contained" disabled={!isFormValid()}>
        Ajouter
      </Button>
    </DialogActions>
  </Box>
</Modal>

{/* Modal pour modifier période d'épreuve */}
<Modal open={openModalEdit} onClose={handleCloseModalEdit}>
  <Box sx={style}>
    <Typography variant="h6" component="h2" gutterBottom>
      Modifier Epreuve
    </Typography>
    <TextField
      required
      label="Nom"
      name="nom"
      fullWidth
      margin="normal"
      value={formData1.nom}
      onChange={handleChange1}
      sx={{ marginBottom: 2 }}
    />
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Début"
          value={formData1.dateDebut}
          onChange={(newValue) => setFormData1(prev => ({ ...prev, dateDebut: newValue }))}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          inputFormat="dd/MM/yyyy"
        />
      </Grid>
      <Grid item xs={6}>
        <DesktopDatePicker
          required
          label="Date Fin"
          value={formData1.dateFin}
          onChange={(newValue) => setFormData1(prev => ({ ...prev, dateFin: newValue }))}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          inputFormat="dd/MM/yyyy"
        />
      </Grid>
    </Grid>
    <TextField
      required
      label="Type"
      name="type"
      fullWidth
      margin="normal"
      value={formData1.type}
      onChange={handleChange1}
      sx={{ marginBottom: 2 }}
    />
    <DialogActions>
      <Button onClick={handleCloseModalEdit} style={{ color: 'black' }}>
        Annuler
      </Button>
      <Button onClick={handleSubmitEdit} variant="contained" disabled={!isFormValid()}>
        Modifier
      </Button>
    </DialogActions>
  </Box>
</Modal>
        {/* Dialog pour modifier semestre  */}
        <Dialog open={openEditSemesterDialog} onClose={() => setOpenEditSemesterDialog(false)}>
          <DialogTitle>Modifier le Semestre</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Numéro de Semestre"
                  value={semesterToEdit ? semesterToEdit.numSemestre : ''}
                  onChange={(e) =>
                    setSemesterToEdit({ ...semesterToEdit, numSemestre: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Nom de Semestre"
                  value={semesterToEdit ? semesterToEdit.nom : ''}
                  onChange={(e) => setSemesterToEdit({ ...semesterToEdit, nom: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Date Début"
                  value={semesterToEdit?.dateDebut ? new Date(semesterToEdit.dateDebut) : null}
                  onChange={(newValue) =>
                    setSemesterToEdit({ ...semesterToEdit, dateDebut: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                    },
                  }}
                />
                <DatePicker
                  label="Date Fin"
                  value={semesterToEdit?.dateFin ? new Date(semesterToEdit.dateFin) : null}
                  onChange={(newValue) =>
                    setSemesterToEdit({ ...semesterToEdit, dateFin: newValue })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                    },
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditSemesterDialog(false)}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateSemester} variant="contained">
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
          <DialogTitle>Confirmer la Suppression</DialogTitle>
          <DialogContent>
            <Typography>Êtes-vous sûr de vouloir supprimer ce semestre ?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              style={{ backgroundColor: 'red', color: 'white' }}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openConfirmDialogJour} onClose={handleCloseConfirmDialogJour}>
  <DialogTitle>Confirmer la Suppression</DialogTitle>
  <DialogContent>
    <Typography>Êtes-vous sûr de vouloir supprimer ce jour férié ?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseConfirmDialogJour}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
    >
      Annuler
    </Button>
    <Button onClick={handleConfirmDeleteJour} variant="contained" style={{ backgroundColor: 'red', color: 'white' }} autoFocus>
      Confirmer
    </Button>
  </DialogActions>
</Dialog>

<Dialog open={openConfirmDialogPeriode} onClose={handleCloseConfirmDialogPeriode}>
  <DialogTitle>Confirmer la Suppression</DialogTitle>
  <DialogContent>
    <Typography>Êtes-vous sûr de vouloir supprimer cette periode ?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseConfirmDialogPeriode}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
    >
      Annuler
    </Button>
    <Button onClick={handleDeletePeriode } variant="contained" style={{ backgroundColor: 'red', color: 'white' }} autoFocus>
      Confirmer
    </Button>
  </DialogActions>
</Dialog>


 {/* Confirmation de suppression */}
 <Dialog open={openConfirmDialogVacance} onClose={handleCloseConfirmDialogVacance}>
        <DialogTitle>Confirmer la Suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cette vacance ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialogVacance}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
          >
            Annuler
          </Button>
          <Button onClick={handleDeleteVacance} variant="contained" style={{ backgroundColor: 'red', color: 'white' }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
        {/* Dialog pour ajouter un semestre */}
        {/* Dialog pour ajouter un semestre */}
        <Dialog open={openSemesterDialog} onClose={() => setOpenSemesterDialog(false)}>
          <DialogTitle>Ajouter un Semestre</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Numéro de Semestre"
                  value={newSemester.numSemestre}
                  onChange={(e) => setNewSemester({ ...newSemester, numSemestre: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Nom de Semestre"
                  value={newSemester.nomSemestre}
                  onChange={(e) => setNewSemester({ ...newSemester, nomSemestre: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Date Début"
                  value={newSemester.dateDebut}
                  onChange={(newValue) => setNewSemester({ ...newSemester, dateDebut: newValue })}
                  minDate={anneeDebut}
                  maxDate={anneeFin}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                    },
                  }}
                />
                <DatePicker
                  label="Date Fin"
                  value={newSemester.dateFin}
                  onChange={(newValue) => setNewSemester({ ...newSemester, dateFin: newValue })}
                  minDate={anneeDebut}
                  maxDate={anneeFin}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                    },
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSemesterDialog(false)}       style={{ color: 'black' }} // Ajout du style pour changer la couleur du texte en noir
            >
              Annuler
            </Button>
            <Button onClick={handleAddSemester} variant="contained"  disabled={!isFormValidSemestre()}>
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Container>
        </Stack>
      </Scrollbar>

      <FullScreenOption />
    </Drawer>
  );
}
