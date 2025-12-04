 import { useSnackbar, enqueueSnackbar } from 'notistack';
import React, { useState, useEffect,useCallback } from 'react';
 
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { Button, Dialog, Select, Checkbox, MenuItem, Typography, DialogTitle, FormControl, ListItemText, DialogActions, DialogContent, LinearProgress, FormControlLabel } from '@mui/material';
 
import { fDate } from 'src/utils/format-time';
 
import { useAuthContext } from 'src/auth/hooks';
import { useGlobalData } from 'src/globalDataProvider';
 import courService from 'src/services/emploi-services/courService';
 import imprimerService from 'src/services/emploi-services/imprimerService';

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
 
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
export default function EdtToolbarSemaine({ date, onManuallySelectedWeeksChange,
  // eslint-disable-next-line react/prop-types
  open,
  // eslint-disable-next-line react/prop-types
  onClose,
  //
  // eslint-disable-next-line react/prop-types
  onCreate,
  // eslint-disable-next-line react/prop-types
  onUpdate,
  //
  // eslint-disable-next-line react/prop-types
  folderName,
  // eslint-disable-next-line react/prop-types
  onChangeFolderName,
  ...other
})   {
  const popover = usePopover();
  const { semestreSelectionne, semestres ,cursusSelectionne} = useGlobalData();
  const [weeks, setWeeks] = useState([]);
  const [manuallySelectedWeeks, setManuallySelectedWeeks] = useState([]);
  const [automaticallySelectedWeek, setAutomaticallySelectedWeek] = useState(null);
  const [selectedClassIds, setSelectedClassIds] = useState([]); // Pour les classes sélectionnées
  const [openClassDialog, setOpenClassDialog] = useState(false); // Pour gérer l'ouverture de la boîte de dialogue
  const [classes, setClasses] = React.useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false); // Loading state for email
   const { userPermissions } = useAuthContext();
 
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openPrintConfirmDialog, setOpenPrintConfirmDialog] = useState(false);
  const [selectedClassEmails, setSelectedClassEmails] = useState([]);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null); // State for uploaded file
  const [files, setFiles] = useState([]);
  const [loadingSnackbar, setLoadingSnackbar] = useState(false);
  const { closeSnackbar } = useSnackbar();

 
  const fetchClasses = async () => {
    try {
      const data = await courService.listerClassesParSemestreEtCursus(semestreSelectionne,cursusSelectionne);
      setClasses(data);
    } catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
    }
};
useEffect(() => {
  if (semestreSelectionne) {
      fetchClasses();
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [semestreSelectionne]);
 
const handleSendClick = () => {
  setOpenClassDialog(true);
};
 
 
 
 
const handlePrintClick = () => {
  setOpenPrintDialog(true);
};
 
// eslint-disable-next-line no-shadow
const getPreviousSunday = (date) => {
  // eslint-disable-next-line react/prop-types
  const currentDay = date.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  const daysToSubtract = currentDay === 0 ? 0 : currentDay; // Si dimanche, ne rien changer
  const sunday = new Date(date);
  // eslint-disable-next-line react/prop-types
  sunday.setDate(date.getDate() - daysToSubtract); // Reculer jusqu'au dimanche
 
  return sunday.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
  }).split('/').reverse().join('-'); // Convertir au format YYYY-MM-DD
};
 
const handlePrintConfirmSend = async () => {
  const controle = true;

  // Ferme la boîte de dialogue de confirmation
  setOpenPrintConfirmDialog(false);

  // Affiche le Snackbar de chargement
  setLoadingSnackbar(true);
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
          /> Génération en cours...
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
    const formattedDate = getPreviousSunday(new Date(date));
    const startDates = [...manuallySelectedWeeks, formattedDate];
    
    await imprimerService.generatePdfMultipleClasse(selectedClassIds, formattedDate, controle);
    
    // Ferme le Snackbar de chargement avant d'afficher le succès
    closeSnackbar(loadingKey);
    enqueueSnackbar('PDF généré avec succès !', { variant: 'success' });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF :', error);
    closeSnackbar(loadingKey); // Ferme le Snackbar de chargement en cas d'erreur
    enqueueSnackbar(error.message || 'Erreur lors de la génération du PDF', { 
      variant: 'error',
      autoHideDuration: 6000
    });
  } finally {
    // Masque le Snackbar de chargement
    setLoadingSnackbar(false);
  }
};
 
// Fonctions de gestion pour les dialogues d'impression
const handlePrintClasses = () => {
  setOpenPrintDialog(false);
  setOpenPrintConfirmDialog(true);
};
 
 
const handleClassChange = (event) => {
  const {value} = event.target;
  setSelectedClassIds(value);
 
  const emails = value.map(id => {
    const classe = classes.find(c => c.idClasse.idClasse === id);
    return classe ? classe.idClasse.emailClasse : null;
  }).filter(Boolean);
 
  setSelectedClassEmails(emails);
  console.log("Emails des classes sélectionnées : ", emails);
 
};
 
   // Envoyer la classe et afficher la boîte de dialogue de confirmation
   const handleSendClasses = () => {
    setOpenClassDialog(false);
    setOpenConfirmDialog(true); // Ouvre la boîte de dialogue de confirmation
};
 
// Fonction pour confirmer l'envoi
// Fonction pour confirmer l'envoi
const handleConfirmSend = async () => {
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
    const controle = true;
    const formattedDate = getPreviousSunday(new Date(date));
    const startDates = [...manuallySelectedWeeks, formattedDate];

    const successMessage = await imprimerService.sendPdfByEmailMultipleClasse(selectedClassIds, startDates, controle);
    
    // Ferme le Snackbar de chargement avant d'afficher le succès
    closeSnackbar(loadingKey);
    enqueueSnackbar(successMessage || 'Emails envoyés avec succès', { 
      variant: 'success',
      autoHideDuration: 6000
    });
    setOpenConfirmDialog(false);
  } catch (error) {
    console.error('Échec de l\'envoi des emails :', error);
    closeSnackbar(loadingKey); // Ferme le Snackbar de chargement en cas d'erreur
    enqueueSnackbar(error.message || 'Échec de l\'envoi des emails', { 
      variant: 'error',
      autoHideDuration: 8000
    });
  } finally {
    setLoadingEmail(false);
  }
};
// Fonction de validation pour les adresses e-mail
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // RegExp simple pour vérifier le format de l'adresse e-mail
  return re.test(String(email).toLowerCase());
};
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
  // Combine manually and automatically selected weeks
  const selectedWeeks = [
    ...manuallySelectedWeeks,
    ...(automaticallySelectedWeek ? [formatToLocalDate(automaticallySelectedWeek.start)] : []),
  ];

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
  }, [open]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
        const newFiles = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );

        setFiles([...files, ...newFiles]);
        // Mettre à jour uploadedFile avec le premier fichier accepté
        if (newFiles.length > 0) {
            setUploadedFile(newFiles[0]); // On peut aussi gérer plusieurs fichiers si nécessaire
        }
    },
    [files]
);
  const handleImportClick = () => {
    setOpenImportDialog(true); // Open the import dialog
  };
  const handleUpload = () => {
    onClose();
    console.info('ON UPLOAD');
  };

  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleFileUpload = async () => {
    console.log('handleFileUpload called');
    if (uploadedFile) {
        try {
            const formattedDate = formatToLocalDate(new Date(date));

            await courService.importCourses(semestreSelectionne, uploadedFile, formattedDate);
            
            enqueueSnackbar('Courses imported successfully!', { variant: 'success' });
            setOpenImportDialog(false); 
        } catch (error) {
            console.error('Failed to import courses:', error);
            enqueueSnackbar(`Error importing courses: ${error.message}`, { variant: 'error' });
        }
    } else {
        console.log('No file uploaded');
    }
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
 
        {(userPermissions.includes('SEND_EMAIL') || userPermissions.includes('IMPRIMER_EMPLOI')) && (
  <IconButton onClick={popover.onOpen}>
    <Iconify icon="eva:more-vertical-fill" />
  </IconButton>
)}
      </Stack>
 
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
          <MenuItem onClick={handleImportClick}>
          <Iconify icon="solar:import-bold" />
          Importer Salles
        </MenuItem>

       {userPermissions.includes('IMPRIMER_EMPLOI') && (
  <MenuItem onClick={() => handlePrintClick()}>
    <Iconify icon="solar:printer-minimalistic-bold" />
    Imprimer
  </MenuItem>
)}
       {userPermissions.includes('SEND_EMAIL') && (
  <MenuItem onClick={handleSendClick}>
    <Iconify icon="mdi:email-outline" />
    Envoyer
  </MenuItem>
)}

<Dialog fullWidth maxWidth="sm" open={openImportDialog} onClose={() => setOpenImportDialog(false)}>
  <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> Importer salles
  </DialogTitle>
  <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
      
    <Upload multiple files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
  </DialogContent>
  <DialogActions>
    <Button
      variant="contained"
      startIcon={<Iconify icon="eva:cloud-upload-fill" />}
      onClick={handleFileUpload}
    >
      Importer
    </Button>
   
    
     
  </DialogActions>
</Dialog>
      </CustomPopover>
      <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)}>
    <DialogTitle>Sélectionnez les classes</DialogTitle>
    <DialogContent>
        <FormControl variant="outlined" sx={{ minWidth: 200, width: '300px' }}>
            <Select
                multiple
                value={selectedClassIds}
                onChange={(event) => {
                    const {value} = event.target;
                    setSelectedClassIds(value);
                }}
                renderValue={(selected) => {
                    if (selected.length === 0) {
                        return 'Sélectionnez les classes';
                    }
                    return selected.map((id) =>
                        classes.find(c => c.id === id)?.idClasse.nomClasse).join(', ');
                }}
                displayEmpty
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 200, // Hauteur maximale du menu
                            width: 300,     // Largeur du menu
                        },
                    },
                }}
            >
                <MenuItem>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={selectedClassIds.length === classes.length}
                                onChange={(event) => {
                                    const allSelected = event.target.checked;
                                    if (allSelected) {
                                        setSelectedClassIds(classes.map(c => c.id));
                                    } else {
                                        setSelectedClassIds([]);
                                    }
                                }}
                            />
                        }
                        label="Sélectionner tous"
                        onClick={(event) => event.stopPropagation()}
                        sx={{
                            width: '100%',
                            margin: 0,
                            padding: 0,
                            '& .MuiFormControlLabel-label': {
                                marginLeft: '8px',
                            },
                            cursor: 'pointer',
                        }}
                    />
                </MenuItem>
                {classes.map((classe) => (
                    <MenuItem key={classe.idClasseid} value={classe.id}>
                        <Checkbox
                            checked={selectedClassIds.indexOf(classe.id) > -1}
                            onChange={(event) => {
                                const newSelectedIds = event.target.checked
                                    ? [...selectedClassIds, classe.id]
                                    : selectedClassIds.filter(id => id !== classe.id);

                                setSelectedClassIds(newSelectedIds);
                            }}
                        />
                        <ListItemText primary={classe.idClasse.nomClasse} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenClassDialog(false)}>Annuler</Button>
        <Button onClick={handleSendClasses}>Envoyer</Button>
    </DialogActions>
</Dialog>
 
       {/* Boîte de dialogue de confirmation d'envoi */}
       <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
    <DialogTitle>Confirmation d&apos;envoi</DialogTitle>
    <DialogContent>
        <Typography variant="body1">
            Êtes-vous sûr de vouloir envoyer cet emploi par email ?
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
            Classes sélectionnées : {
                selectedClassIds.length === classes.length 
                    ? "Toutes les classes" 
                    : selectedClassIds.map(id => {
                        const classe = classes.find(c => c.id === id);
                        return classe ? classe.idClasse.nomClasse : null;
                    }).filter(Boolean).join(', ')
            }
        </Typography>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenConfirmDialog(false)}>Annuler</Button>
        <Button 
            onClick={() => {
                handleConfirmSend(); 
                setOpenConfirmDialog(false); 
            }}
        >
            Confirmer
        </Button>
    </DialogActions>
</Dialog>
 
              {/* Boîte de dialogue d'impression */}
              <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)}>
    <DialogTitle>Sélectionnez les classes</DialogTitle>
    <DialogContent>
        <FormControl variant="outlined" sx={{ minWidth: 200, width: '300px' }}>
            <Select
                multiple
                value={selectedClassIds}
                onChange={(event) => {
                    const { value } = event.target;
                    setSelectedClassIds(value);
                }}
                renderValue={(selected) => {
                    if (selected.length === 0) {
                        return 'Sélectionnez les classes';
                    }
                    return selected.map((id) =>
                        classes.find(c => c.id === id)?.idClasse.nomClasse).join(', ');
                }}
                displayEmpty
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 200, // Hauteur maximale du menu
                            width: 300,     // Largeur du menu
                        },
                    },
                }}
            >
                <MenuItem>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={selectedClassIds.length === classes.length}
                                onChange={(event) => {
                                    const allSelected = event.target.checked;
                                    if (allSelected) {
                                        setSelectedClassIds(classes.map(c => c.id));
                                    } else {
                                        setSelectedClassIds([]);
                                    }
                                }}
                            />
                        }
                        label="Sélectionner tous"
                        onClick={(event) => event.stopPropagation()}
                        sx={{
                            width: '100%',
                            margin: 0,
                            padding: 0,
                            '& .MuiFormControlLabel-label': {
                                marginLeft: '8px',
                            },
                            cursor: 'pointer',
                        }}
                    />
                </MenuItem>
                {classes.map((classe) => (
                    <MenuItem key={classe.id} value={classe.id}>
                        <Checkbox
                            checked={selectedClassIds.indexOf(classe.id) > -1}
                            onChange={(event) => {
                                const newSelectedIds = event.target.checked
                                    ? [...selectedClassIds, classe.id]
                                    : selectedClassIds.filter(id => id !== classe.id);

                                setSelectedClassIds(newSelectedIds);
                            }}
                        />
                        <ListItemText primary={classe.idClasse.nomClasse} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenPrintDialog(false)}>Annuler</Button>
        <Button onClick={handlePrintClasses}>Imprimer</Button>
    </DialogActions>
</Dialog>
 
{/* Boîte de dialogue de confirmation d'impression */}
<Dialog open={openPrintConfirmDialog} onClose={() => setOpenPrintConfirmDialog(false)}>
  <DialogTitle>Confirmation d&apos;impression</DialogTitle>
  <DialogContent>
    <Typography variant="body1">
      Êtes-vous sûr de vouloir imprimer ?
    </Typography>
    <Typography variant="body2" sx={{ mt: 1 }}>
      Classes sélectionnées : {
        selectedClassIds.length === classes.length 
          ? "Toutes les classes" 
          : selectedClassIds.map(id => {
              const classe = classes.find(c => c.id === id);
              return classe ? classe.idClasse.nomClasse : null;
            }).filter(Boolean).join(', ')
      }
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenPrintConfirmDialog(false)}>Annuler</Button>
    <Button 
      onClick={() => {
        handlePrintConfirmSend(); // Appelle la fonction pour imprimer
        setOpenPrintConfirmDialog(false); // Ferme la boîte de dialogue
      }}
    >
      Confirmer
    </Button>
  </DialogActions>
</Dialog>
 
    </>
  );
}