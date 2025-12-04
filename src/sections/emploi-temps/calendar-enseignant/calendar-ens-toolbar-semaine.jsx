/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
 
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import {
    Dialog,
    Select,
    Button,
    Checkbox,
    MenuItem,
    Typography,
    DialogTitle,
    FormControl,
    ListItemText,
    DialogActions,
    DialogContent,
    LinearProgress,
    FormControlLabel
} from '@mui/material';
 
import { fDate } from 'src/utils/format-time';
 
import { useGlobalData } from 'src/globalDataProvider';
import enseignantService from 'src/services/emploi-services/enseignantService';
 
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover'; // Service to get teachers
import { useSnackbar, enqueueSnackbar } from 'notistack';

import { useAuthContext } from 'src/auth/hooks';
import imprimerService from 'src/services/emploi-services/imprimerService';
 
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
    const { semestreSelectionne, semestres,cursusSelectionne } = useGlobalData();
    const [weeks, setWeeks] = useState([]);
    const [manuallySelectedWeeks, setManuallySelectedWeeks] = useState([]);
    const [automaticallySelectedWeek, setAutomaticallySelectedWeek] = useState(null);
    const [openTeacherDialog, setOpenTeacherDialog] = useState(false);
    const [enseignants, setEnseignants] = useState([]);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
    const [openPrintDialog, setOpenPrintDialog] = useState(false);
    const [openConfirmPrintDialog, setOpenConfirmPrintDialog] = useState(false);
    const [selectedTeacherEmails, setSelectedTeacherEmails] = useState([]);
    const [loadingEmail, setLoadingEmail] = useState(false); // Loading state for email
    const { userPermissions } = useAuthContext();
  const { closeSnackbar } = useSnackbar();
 
 

    useEffect(() => {
        const fetchEnseignants = async () => {
          try {
            const data = await enseignantService.getEnseignantsBySemestreEtCursus(semestreSelectionne,cursusSelectionne);
            if (Array.isArray(data)) {
              setEnseignants(data);
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des enseignants:', error);
          }
        };
   
        fetchEnseignants();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
 
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
 const {  anneeSelectionne } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres
 
 
 const handleConfirmPrint = async () => {
  const controle = true;

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
          /> 
          Génération en cours...
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
      
      await imprimerService.generatePdfMultipleEns(selectedTeacherIds, formattedDate, anneeSelectionne, controle);
      
      // Ferme le Snackbar de chargement avant d'afficher le succès
      closeSnackbar(loadingKey);
      enqueueSnackbar('PDF généré avec succès !', { variant: 'success' });
      setOpenConfirmPrintDialog(false);
  } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      closeSnackbar(loadingKey); // Ferme le Snackbar de chargement en cas d'erreur
      enqueueSnackbar(error.message || 'Erreur lors de la génération du PDF', { 
          variant: 'error',
          autoHideDuration: 6000
      });
  }
};
 
 
 
 
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
    // Ouvre le dialog pour sélectionner les enseignants
    const handleSendClick = () => {
        setOpenTeacherDialog(true);
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
                /> 
                Envoi en cours...
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
    
            const successMessage = await imprimerService.sendPdfByEmailMultipleEnseignant(
                selectedTeacherIds, 
                formattedDate,
                anneeSelectionne,
                controle
            );
    
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
                                label={`${week.shortLabel} `} // Affiche l'étiquette de la semaine
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
                sx={{ width: 140 }}
            >
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
            </CustomPopover>
            <Dialog open={openTeacherDialog} onClose={() => setOpenTeacherDialog(false)}>
    <DialogTitle>Sélectionnez un enseignant</DialogTitle>
    <DialogContent>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200, width: '300px' }}>
            <Select
                multiple
                value={selectedTeacherIds}
                onChange={(event) => {
                    const { value } = event.target;
                    setSelectedTeacherIds(value);
                }}
                renderValue={(selected) => {
                    if (selected.length === 0) {
                        return 'Sélectionnez des enseignants'; // Message par défaut
                    }
                    return selected.map((id) => {
                        const enseignant = enseignants.find(e => e.id === id);
                        return enseignant ? `${enseignant.nom} ${enseignant.prenom}` : '';
                    }).join(', '); // Affiche les noms des enseignants sélectionnés
                }}
                displayEmpty
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 200,
                            width: 300,
                        },
                    },
                }}
            >
                <MenuItem>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={selectedTeacherIds.length === enseignants.length}
                                onChange={() => {
                                    const allSelected = selectedTeacherIds.length === enseignants.length;
                                    if (allSelected) {
                                        setSelectedTeacherIds([]);
                                    } else {
                                        setSelectedTeacherIds(enseignants.map(e => e.id));
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
                {enseignants.sort((a, b) => {
                    const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
                    const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
                    // eslint-disable-next-line no-nested-ternary
                    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
                     }).map((enseignant) => (
                    <MenuItem key={enseignant.id} value={enseignant.id}>
                        <Checkbox
                            checked={selectedTeacherIds.indexOf(enseignant.id) > -1}
                            onChange={(event) => {
                                const newSelectedIds = event.target.checked
                                    ? [...selectedTeacherIds, enseignant.id]
                                    : selectedTeacherIds.filter(id => id !== enseignant.id);
 
                                setSelectedTeacherIds(newSelectedIds);
                            }}
                        />
                        <ListItemText primary={`${enseignant.nom} ${enseignant.prenom}`} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenTeacherDialog(false)}>Annuler</Button>
        <Button
            onClick={() => {
                setOpenTeacherDialog(false);
                setOpenConfirmDialog(true); // Ouvre la boîte de dialogue de confirmation
            }}
        >
            Envoyer
        </Button>
    </DialogActions>
</Dialog>
            {/* Boîte de dialogue de confirmation d'envoi */}
           
{/* Boîte de dialogue de confirmation d'envoi */}
<Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
    <DialogTitle>Confirmation d&apos;envoi</DialogTitle>
    <DialogContent>
        <Typography variant="body1">
            Êtes-vous sûr de vouloir envoyer cette sélection par email ?
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
            Enseignants sélectionnés : {selectedTeacherIds.length === enseignants.length
                ? 'Tous les enseignants'
                : selectedTeacherIds.length > 0
                    ? selectedTeacherIds.map(id => {
                        const enseignant = enseignants.find(e => e.id === id);
                        return enseignant ? `${enseignant.nom} ${enseignant.prenom}` : null;
                    }).join(', ')
                : 'Aucun enseignant sélectionné'}
        </Typography>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenConfirmDialog(false)} disabled={loadingEmail}>
            Annuler
        </Button>
        <Button 
            onClick={() => {
                handleConfirmSend(); // Appelle la fonction pour envoyer l'email
                setOpenConfirmDialog(false); // Ferme la boîte de dialogue
            }} 
            disabled={loadingEmail}
        >
            Confirmer
        </Button>
    </DialogActions>
</Dialog>
 
 
 
{/* Dialog d'impression, identique au dialog de sélection des enseignants */}
<Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)}>
    <DialogTitle>Sélectionnez les enseignants pour impression</DialogTitle>
    <DialogContent>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200, width: '300px' }}>
            <Select
                multiple
                value={selectedTeacherIds}
                onChange={(event) => {
                    const { value } = event.target;
                    setSelectedTeacherIds(value);
                }}
                renderValue={(selected) => {
                    if (selected.length === 0) {
                        return 'Sélectionnez des enseignants'; // Message par défaut
                    }
                    return selected.map((id) => {
                        const enseignant = enseignants.find(e => e.id === id);
                        return enseignant ? `${enseignant.nom} ${enseignant.prenom}` : '';
                    }).join(', '); // Affiche les noms des enseignants sélectionnés
                }}
                displayEmpty
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 200,
                            width: 300,
                        },
                    },
                }}
            >
                <MenuItem disableRipple>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={selectedTeacherIds.length === enseignants.length}
                                indeterminate={
                                    selectedTeacherIds.length > 0 &&
                                    selectedTeacherIds.length < enseignants.length
                                }
                                onChange={(event) => {
                                    if (event.target.checked) {
                                        setSelectedTeacherIds(enseignants.map((e) => e.id));
                                    } else {
                                        setSelectedTeacherIds([]);
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

                {enseignants.sort((a, b) => {
                    const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
                    const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
                    // eslint-disable-next-line no-nested-ternary
                    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
                }).map((enseignant) => (
                    <MenuItem key={enseignant.id} value={enseignant.id}>
                        <Checkbox
                            checked={selectedTeacherIds.indexOf(enseignant.id) > -1}
                            onChange={(event) => {
                                const newSelectedIds = event.target.checked
                                    ? [...selectedTeacherIds, enseignant.id] // Ajoute l'enseignant aux sélectionnés
                                    : selectedTeacherIds.filter(id => id !== enseignant.id); // Retire l'enseignant des sélectionnés

                                setSelectedTeacherIds(newSelectedIds);
                            }}
                        />
                        <ListItemText primary={`${enseignant.nom} ${enseignant.prenom}`} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenPrintDialog(false)}>Annuler</Button>
        <Button onClick={() => {
            setOpenPrintDialog(false);
            setOpenConfirmPrintDialog(true); // Ouvre la boîte de dialogue de confirmation d'impression
        }}>
            Imprimer
        </Button>
    </DialogActions>
</Dialog>
 
{/* Dialog de confirmation d'impression */}
<Dialog open={openConfirmPrintDialog} onClose={() => setOpenConfirmPrintDialog(false)}>
    <DialogTitle>Confirmation d&apos;impression</DialogTitle>
    <DialogContent>
        <Typography variant="body1">
            Êtes-vous sûr de vouloir imprimer cette sélection ?
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
            Enseignants sélectionnés : {selectedTeacherIds.length === enseignants.length
                ? 'Tous les enseignants'
                : selectedTeacherIds.length > 0
                    ? selectedTeacherIds.map(id => {
                        const enseignant = enseignants.find(e => e.id === id);
                        return enseignant ? `${enseignant.nom} ${enseignant.prenom}` : null;
                    }).join(', ')
                : 'Aucun enseignant sélectionné'}
        </Typography>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenConfirmPrintDialog(false)}>Annuler</Button>
        <Button 
            onClick={() => {
                handleConfirmPrint(); // Appelle la fonction pour imprimer
                setOpenConfirmPrintDialog(false); // Ferme la boîte de dialogue
            }}
        >
            Confirmer
        </Button>
    </DialogActions>
</Dialog>
 
                    </>
    );
}