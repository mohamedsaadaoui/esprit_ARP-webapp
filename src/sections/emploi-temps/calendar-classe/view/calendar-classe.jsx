import { addDays } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useTheme } from '@emotion/react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useState, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import { Box, Menu, Stack, Alert, Dialog, Button, Select, MenuItem, Checkbox, TextField, InputLabel, DialogTitle, FormControl, DialogContent, DialogActions, LinearProgress, FormControlLabel, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';
 
import { useAuthContext } from 'src/auth/hooks';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock';
import { useGlobalData } from 'src/globalDataProvider';
import courService from 'src/services/emploi-services/courService';
import vacanceService from 'src/services/emploi-services/vacanceService';
import PermissionBasedGuard from 'src/auth/guard/permession-based-guard';
import jourFerieService from 'src/services/emploi-services/jourFerrieService';
import annulerCoursService from 'src/services/emploi-services/annulerCoursService';

import './style.css';
import { StyledCalendar } from '../styles';
import { useEvent, useCalendar } from '../hooks';
 import CalendarForm from '../calendar-classe-form';
import CalendarToolbar from '../calendar-classe-toolbar';
 
 
// 2. Modifier la fonction fetchCoursParClasseEtSemestre
 
 
export default function CalendarView() {
  const smUp = useResponsive('down', 'sm');
  const openFilters = useBoolean();
  const [events, setEvents] = useState([]);
 
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');  // État pour la classe sélectionnée
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [selectEventId, setSelectEventId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const { enqueueSnackbar } = useSnackbar();
  const { userPermissions } = useAuthContext();
  const [loadingCour, setLoadingCour] = useState(false);

  const theme = useTheme();
 
 
  const [confirmUncheckOpen, setConfirmUncheckOpen] = useState(false);
  const [weekToUncheck, setWeekToUncheck] = useState(null);
  const [setAvailabilityToDelete] = useState(null);
  const [setConfirmAvailabilityDeleteOpen] = useState(null);
 
  const [weeks, setWeeks] = useState([]);
  const [openWeekDialog, setOpenWeekDialog] = useState(false);
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [selectedWeeksManually, setSelectedWeeksManually] = useState([]);
 const [openCancelDialog, setOpenCancelDialog] = useState(false);
 const [cancellationDescription, setCancellationDescription] = useState('');
 const [selectedReason, setSelectedReason] = useState('');
 const [motifs, setMotifs] = useState([]);
 const [loading, setLoading] = useState(false);

 const { vacancesList } = useGlobalData();
  
  useEffect(() => {
   
    console.log("Liste des semaines manuellement sélectionnées dans CalendarView:", selectedWeeksManually);
    console.log("vacancesList:", vacancesList);

  }, [selectedWeeksManually,vacancesList]);
 
 
  const { semestreSelectionne, semestres, anneeSelectionne, cursusSelectionne} = useGlobalData(); // Récupérez les données globales 
  // eslint-disable-next-line no-shadow
  const findSemestreById = (semestreSelectionneId, semestres) => semestres.find(semestre => semestre.id === semestreSelectionneId);
  const semestreCorrespondant = findSemestreById(semestreSelectionne, semestres);
  // console.log('id du semestre sélectionné :', semestreCorrespondant.id);
  // console.log('Date de début du semestre sélectionné :', semestreCorrespondant.dateDebut);
 
// eslint-disable-next-line no-shadow
const fetchCoursParClasseEtSemestre = async (idClasse) => {
  setLoadingCour(true); // Début du chargement
  try {
    const cours = await courService.listerCoursActifParClasseEtSemestre(idClasse);
    const formattedEvents = cours.map((cour) => {
      const enseignantNoms = Array.from(cour.employes)
        .map(employe => `${employe.nom} ${employe.prenom}`)
        .join(', ');

      return {
        start: `${cour.datecours}T${cour.idplagehoraire.heureDebut}`,
        end: `${cour.datecours}T${cour.idplagehoraire.heureFin}`,
        id: cour.id,
        title: `${cour.modules[0]?.designation || 'Sans désignation'} - ${enseignantNoms}`,
        className: cour.ratrappage ? 'cour-background-annule rattrapage-border' : 'cour-background',
        textColor: cour.ratrappage ? "#2e86c1" : "Red",
        plageHoraire: cour.idplagehoraire.id,
        salle: cour.salles[0],
        type: "Cours",
      };
    });

    return formattedEvents;
  } catch (error) {
    console.error('Erreur lors de la récupération des cours par classe et semestre:', error);
    return [];
  } finally {
    setLoadingCour(false); // Fin du chargement dans tous les cas
  }
};


const fetchVacances = async (cursusId) => {
  try {
    const vacances = await vacanceService.getAllVacancesByCursus(cursusId);
    const formattedVacances = vacances.map((vacance) => {
      const start = `${vacance.dateDebut}T00:00:00`;
      const end = `${vacance.dateFin}T23:59:59`; // Fin à 23:59:59 du dernier jour
      return {
        // eslint-disable-next-line object-shorthand
        start: start,
        // eslint-disable-next-line object-shorthand
        end: end,
        title: `Vacances - ${vacance.nom || ''}`,
         display: 'background',
        className: 'indispo-background',
      };
    });
    return formattedVacances; // Retourner les événements formatés pour les vacances
  } catch (error) {
    console.error('Erreur lors de la récupération des vacances:', error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};
const fetchJoursFeries = async (anneeUniversitaireId) => {
  try {
    const joursFeries = await jourFerieService.getAllJoursFeries(anneeUniversitaireId);
    const formattedHolidays = joursFeries.map((jour) => {
      const start = `${jour.dateDebut}T00:00:00`; // Début à 00:00:00 du jour

      // Créer des objets Date pour effectuer la comparaison
      const dateDebut = new Date(jour.dateDebut);
      const dateFin = new Date(jour.dateFin);

      // Si la date de début et la date de fin sont identiques, fin à 23:59:59 du même jour
      let end;
      if (dateDebut.toISOString().split('T')[0] === dateFin.toISOString().split('T')[0]) {
        end = `${jour.dateDebut}T23:59:59`; // Fin à 23:59:59 du même jour
      } else {
        end = `${jour.dateFin}T00:00:00`; // Sinon, fin du jour suivant
        end = new Date(new Date(end).getTime() - 1 * 60 * 1000).toISOString(); // Ajuster pour être avant minuit
      }

      return {
        // eslint-disable-next-line object-shorthand
        start: start,
        end: new Date(end).toISOString(), // Assurez-vous que la date est au format ISO
        title: `Jour Férié - ${jour.nom || ''}`,    
        className: 'cours-dispo', // Classe pour le style des jours fériés
        textColor: "gray",// Couleur du texte pour les jours fériés
      };
    });
    return formattedHolidays; // Retourner les événements formatés pour les jours fériés
  } catch (error) {
    console.error('Erreur lors de la récupération des jours fériés:', error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};
const fetchData = async () => {
  try {
    const coursEvents = await fetchCoursParClasseEtSemestre(selectedClassId);
    if (anneeSelectionne) {
      const joursFeriesEvents = await fetchJoursFeries(anneeSelectionne);
      const vacancesEvents = await fetchVacances(cursusSelectionne);
      const allEvents = [...coursEvents, ...joursFeriesEvents, ...vacancesEvents];
            setEvents(allEvents);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
  }
};

useEffect(() => {
  if (selectedClassId)
  fetchData();
  else setEvents([]);
  console.log(events);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedClassId]);

  useEffect(() => {
    setEvents([]);
    setSelectedClassId("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursusSelectionne]);

 
useEffect(() => {
    if (semestreSelectionne && semestres.length > 0) {
      const semestreData = semestres.find(s => s.id === semestreSelectionne);
      if (semestreData) {
        generateWeeks(semestreData);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semestreSelectionne, semestres]);
 
// Récupérer les motifs d'annulation lors du montage du composant
useEffect(() => {
  const fetchMotifs = async () => {
    try {
      const data = await annulerCoursService.getAllMotifs();
      setMotifs(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des motifs d\'annulation :', error);
    }
  };
 
  fetchMotifs();
}, []);
 
 
const handleCancelCourseMenu = () => {
  if (selectEventId) {
    setOpenCancelDialog(true);
    onCloseMenu();  
  } else {
    enqueueSnackbar('Veuillez sélectionner un cours avant de continuer.', { variant: 'warning' });
  }
};
// Fonction pour gérer la soumission d'annulation
const handleCancelCourse = async () => {
  setLoading(true);
  if (!selectedReason) {
    enqueueSnackbar('Veuillez sélectionner un motif avant de continuer.', { variant: 'warning' });
    return;
  }
 
  try {
    console.log('ID du cours à annuler:', selectEventId); // Utiliser selectEventId directement
    console.log('Motif sélectionné ID:', selectedReason); // ID du motif sélectionné
 
    // Appeler le service d'annulation
    const response = await annulerCoursService.annulerCours(selectEventId, selectedReason, cancellationDescription);
   
    // Afficher le message de succès
    enqueueSnackbar('Cours annulé avec succès!', { variant: 'success' });
    // Rafraîchir les données après l'annulation
    fetchData();
 
  } catch (error) {
    console.error('Erreur lors de l\'annulation du cours :', error);
  } finally {
    setLoading(false); 
    setOpenCancelDialog(false);
    onCloseMenu();  
 
  }
};
 
const toUTCDate = (date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

// Fonction utilitaire pour obtenir la date de début effective d'une période de vacances
// Si la date de début est un dimanche (getUTCDay() === 0), on la décale au lundi suivant
const getEffectiveVacationStart = (dateDebut) => {
  const effectiveDate = toUTCDate(new Date(dateDebut));
  if (effectiveDate.getUTCDay() === 0) {
    effectiveDate.setUTCDate(effectiveDate.getUTCDate() + 1);
  }
  return effectiveDate;
};

// Fonction de vérification du chevauchement d'une semaine avec une période de vacances
const isOverlappingVacation = (weekStart, weekEnd) => vacancesList.some((vacation) => {
    // Convertir les dates de début et de fin en UTC
    const vacationStart = getEffectiveVacationStart(vacation.dateDebut);
    const vacationEnd = toUTCDate(new Date(vacation.dateFin));
    
    // La semaine chevauche une vacance si elle commence avant la fin des vacances
    // et se termine après la date de début effective des vacances.
    return weekStart <= vacationEnd && weekEnd >= vacationStart;
  });
 
 
  const  generateWeeks = (semestreData) => {
    const weeksArray = [];
    const start = new Date(semestreData.dateDebut);
    const end = new Date(semestreData.dateFin);
  
    const current = toUTCDate(start);
    const endDate = toUTCDate(end);
  
    // Aligner sur le premier jour de la semaine (lundi)
    while (current.getUTCDay() !== 1) {
      current.setUTCDate(current.getUTCDate() + 1);
    }
  
    while (current < endDate) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  
      // Vérifier si la semaine chevauche une période de vacances 
      if (!isOverlappingVacation(weekStart, weekEnd, vacancesList)) {
        weeksArray.push({
          id: `week-${weeksArray.length + 1}`,
          label: `Semaine ${weeksArray.length + 1} (${fDate(weekStart)} - ${fDate(weekEnd)})`,
          start: weekStart,
          end: weekEnd,
        });
      }
  
      // Passer à la semaine suivante
      current.setUTCDate(current.getUTCDate() + 7);
    }
    
    setWeeks(weeksArray);
  };
 
const [disabledWeeks, setDisabledWeeks] = useState([]); // État pour stocker les semaines désactivées
 
 
const handleOpenWeekDialog = async () => {
  onCloseMenu(); 
  setOpenWeekDialog(true); // Ouvrir la boîte de dialogue 
  setIsLoading(true);
  try {
    // 1. Récupérer les détails du cours original
    const originalCourse = await courService.getCourById(selectEventId);
    const originalDate = new Date(originalCourse.datecours);
    const originalDay = originalDate.getDay(); // Jour de la semaine (0 = dimanche, 1 = lundi, etc.)
    const originalModule = originalCourse.modules[0]?.id;
    const originalStart = originalCourse.idplagehoraire.heureDebut;
    const originalEnd = originalCourse.idplagehoraire.heureFin;
 
    // 2. Récupérer tous les cours existants
    const allCourses = await courService.listerCoursActifParClasseEtSemestre(
      selectedClassId
    );
 
    // 3. Trouver les semaines avec conflits (même module et même plage horaire)
    const conflictWeeks = weeks.filter((week) => {
      // Calculer la date cible dans cette semaine
      const weekStart = new Date(week.start);
      const targetDate = new Date(weekStart);
      targetDate.setDate(weekStart.getDate() + (originalDay - weekStart.getDay() + 7) % 7);
      const targetDateStr = targetDate.toISOString().split('T')[0];
 
      // Vérifier si la date est dans le semestre
      if (targetDate > new Date(semestreSelectionne.dateFin)) return false;
 
      // Vérifier les conflits (même module et même plage horaire)
      return allCourses.some(
        (c) =>
          c.datecours === targetDateStr && // Même date
          c.modules[0]?.id === originalModule && // Même module
          c.idplagehoraire.heureDebut === originalStart && // Même heure de début
          c.idplagehoraire.heureFin === originalEnd // Même heure de fin
      );
    });
 
    // 4. Trouver les semaines désactivées (chevauchement de plage horaire avec un module différent)
    const newDisabledWeeks = weeks.filter((week) => {
      const weekStart = new Date(week.start);
      const targetDate = new Date(weekStart);
      targetDate.setDate(weekStart.getDate() + (originalDay - weekStart.getDay() + 7) % 7);
      const targetDateStr = targetDate.toISOString().split('T')[0];
 
      // Vérifier si la date est dans le semestre
      if (targetDate > new Date(semestreSelectionne.dateFin)) return false;
 
      // Vérifier les conflits de plage horaire avec un module différent
      return allCourses.some((c) => {
        // Même date et module différent
        if (c.datecours !== targetDateStr || c.modules[0]?.id === originalModule) return false;
 
        // Vérifier le chevauchement temporel
        const existingStart = c.idplagehoraire.heureDebut;
        const existingEnd = c.idplagehoraire.heureFin;
 
        // Utiliser la fonction hasTimeOverlap pour vérifier les chevauchements
        return hasTimeOverlap(originalStart, originalEnd, existingStart, existingEnd);
      });
    }).map((week) => week.id);
 
    // 5. Mettre à jour les états
    setSelectedWeeks(conflictWeeks.map((w) => w.id)); // Semaines avec conflits
    setDisabledWeeks(newDisabledWeeks); // Semaines désactivées
 
  } catch (error) {
    // Gestion des erreurs
    console.error('Erreur lors de la vérification des conflits:', error);
    enqueueSnackbar('Erreur de vérification des conflits', { variant: 'error' });
  } finally {
      setIsLoading(false);
  }
};
const handleCloseWeekDialog = () => {
  setOpenWeekDialog(false);
  setSelectEventId('');
  setSelectedWeeks([]); // Réinitialiser les semaines sélectionnées à la fermeture
};
 
const [isLoading, setIsLoading] = useState(false);
 
// 4. Modifier handleWeekChange
 
 
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
 
const handleWeekChange = async (event) => {
  const { value, checked } = event.target;
  const week = weeks.find((w) => w.id === value);

  if (checked) {
      setIsLoading(true);
      try {
          const originalCourse = await courService.getCourById(selectEventId);
          const originalDate = new Date(originalCourse.datecours);
          const originalDay = originalDate.getDay();
          const originalModule = originalCourse.modules[0]?.id;
          const originalPlage = originalCourse.idplagehoraire.id;

          // Calcul de la date cible
          const weekStart = new Date(week.start);
          const targetDate = new Date(weekStart);
          targetDate.setDate(weekStart.getDate() + (originalDay - weekStart.getDay() + 7) % 7);

          // Vérification des conflits étendue
          const allCourses = await courService.listerCoursActifParClasseEtSemestre(selectedClassId);
          const hasConflict = allCourses.some(
              (c) =>
                  c.datecours === targetDate.toISOString().split('T')[0] &&
                  c.idplagehoraire.id === originalPlage &&
                  c.modules[0]?.id !== originalModule
          );

          if (hasConflict) {
              throw new Error('Un cours existe déjà dans cette plage horaire (module différent)');
          }

          // Duplication
          await courService.dupliquerCours(selectEventId, formatLocalDate(targetDate));
          fetchData();
          setSelectedWeeks((prev) => [...prev, value]);
          enqueueSnackbar('Cours dupliqué avec succès!', { variant: 'success' });
      } catch (error) {
          const errorMsg = error.response?.data || error.message || "Erreur lors de la duplication du cours";
          enqueueSnackbar(errorMsg, { variant: 'error' });
      } finally {
          setIsLoading(false);
      }
  } else {
      // Gestion du décochage
      setWeekToUncheck(week);
      setConfirmUncheckOpen(true);
  }
};
 
 
   
const handleConfirmUncheck = async () => {
  if (!weekToUncheck) return;
 
  setIsLoading(true);
  try {
    const originalCourse = await courService.getCourById(selectEventId);
    const originalDate = new Date(originalCourse.datecours);
    const originalDay = originalDate.getDay();
    const originalModule = originalCourse.modules[0]?.id;
    const originalPlage = originalCourse.idplagehoraire.id;
 
    const weekStart = new Date(weekToUncheck.start);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + ((originalDay - weekStart.getDay() + 7) % 7));
 
    const allCourses = await courService.listerCoursActifParClasseEtSemestre(selectedClassId);
 
    const courseToDelete = allCourses.find(
      (c) =>
        c.datecours === formatLocalDate(targetDate) &&
        c.modules[0]?.id === originalModule &&
        c.idplagehoraire.id === originalPlage
    );
 
    if (courseToDelete) {
      await courService.supprimerCour(courseToDelete.id);
      fetchData();
      await fetchCoursParClasseEtSemestre(selectedClassId);
      
      enqueueSnackbar('Cours supprimé avec succès!', { variant: 'success' });
      setSelectedWeeks((prev) => prev.filter((id) => id !== weekToUncheck.id));
    } else {
      enqueueSnackbar('Aucun cours trouvé pour cette semaine.', { variant: 'warning' });
    }
  } catch (error) {
    enqueueSnackbar('Erreur lors de la suppression du cours', { variant: 'error' });
  } finally {
    setIsLoading(false);
    setConfirmUncheckOpen(false);
    setWeekToUncheck(null);
  }
};
 
 
 
 
 
const handleAddEvent = async (newEvent) => {
  try {
    // Ajouter le nouvel événement localement
   
    // Déclencher le rafraîchissement des données
    // setRefreshData(true);
    fetchData();
    // Afficher un message de succès
    // enqueueSnackbar('Événement ajouté avec succès!', { variant: 'success' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'événement:', error);
    // enqueueSnackbar('Erreur lors de l\'ajout de l\'événement.', { variant: 'error' });
  }
};

  const holidays = [];
  const {
    calendarRef,
    view,
    date,
    onDatePrev,
    onDateNext,
    onDateToday,
    onChangeView,
    onSelectRange,
    onInitialView,
    openForm,
    onOpenForm,
    onCloseForm,
    openMenu,
    onOpenMenu,
    onCloseMenu,
    selectedRange,
  } = useCalendar(holidays);
  const currentEvent = useEvent(events, selectEventId, selectedRange, openForm);
  useEffect(() => {
    onInitialView();
  }, [onInitialView]);
 
  const handleEventClick = (info) => {
    // Vérifier si l'événement est une disponibilité (par exemple, en fonction de la couleur du texte)
    if (info.event.extendedProps.type === "Cours") {
      setSelectEventId(info.event.id);
      setMenuPosition({ top: info.jsEvent.clientY + 5, left: info.jsEvent.clientX + 5 });
      onOpenMenu();
    } else {
    setAvailabilityToDelete(info.event.id);
    setConfirmAvailabilityDeleteOpen(true);
      // Gérer les autres types d'événements si nécessaire
      console.log("Autre type d'événement cliqué");
    }
  };  
  const handleDeleteEvent = async () => {
    if (!eventToDelete) {
      enqueueSnackbar('Aucun événement sélectionné pour la suppression.', { variant: 'warning' });
      return;
    }
    try {
      await courService.supprimerCour(eventToDelete);
      fetchData();
 
      if (selectedClassId) { // Utilisez selectedClassId pour récupérer les cours de la classe sélectionnée
        await fetchCoursParClasseEtSemestre(selectedClassId, setEvents);
      }
      enqueueSnackbar('Suppression réussie!', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      enqueueSnackbar('Erreur lors de la suppression de l\'événement.', { variant: 'error' });
    } finally {
      setConfirmDeleteOpen(false);
      onCloseMenu();  
    }
  };  const handleSelectEnseignant = (selectedId) => {
    setSelectedTeacherId(selectedId);
    console.log('Enseignant sélectionné ID:', selectedId);
  };
  const handleSelectModule = (selectedId) => {
    setSelectedModuleId(selectedId);
    console.log('Module sélectionné ID:', selectedId);
  };
  const handleSelectClass = (selectedId) => {
    setSelectedClassId(selectedId);
    console.log('Classe sélectionnée ID:', selectedId); // Affiche l'ID de la classe sélectionnée
  };
 
 
 
// Convertir l'heure en minutes depuis minuit
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
 
// Vérifier le chevauchement entre deux plages horaires
const hasTimeOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
 
  return (s1 < e2 && e1 > s2);
};
 

const [bounds, setBounds] = useState(null);

  useEffect(() => {
    const fetchBounds = async () => {
      try {
        const result = await courService.getBoundsByCursusId(cursusSelectionne);
        setBounds(result);
      } catch (error) {
        console.error("Erreur lors du chargement des bornes horaires :", error);
      }
    };

    if (cursusSelectionne) {
      fetchBounds();
    }
  }, [cursusSelectionne]);

  const formatHour = (hour) => {
    const hourString = hour.toString().padStart(2, '0');
    return `${hourString}:00`;
  };
  return (

    <PermissionBasedGuard permissions={['VIEW_COUR']}hasContent>


<div className="calendar-view">
{
  semestreCorrespondant && bounds ? <Card>
  <StyledCalendar>
  <CalendarToolbar
             
              date={date}
              view={view}
              loading={loadingCour}

              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenFilters={openFilters.onTrue}
              onSelectEnseignant={handleSelectEnseignant}
              selectedTeacherId={selectedTeacherId}
              onSelectModule={handleSelectModule}
              selectedModuleId={selectedModuleId}
              onSelectClass={handleSelectClass} // Passer la fonction pour sélectionner une classe
             onManuallyWeeksUpdate={setSelectedWeeksManually}  // Utilisation du nouveau nom de prop
   
   
            />
  <Calendar
    events={events}
    validRange={{
      start: semestreCorrespondant?.dateDebut ,
      end: addDays(new Date(semestreCorrespondant.dateFin), 1),
      }}
  // date={currentDate}

  // datesSet={handleDatesSet} // <-- Callback déclenchée à chaque navigation
    weekends
    editable={false}
    droppable={false}
    selectable
    rerenderDelay={10}
    allDayMaintainDuration
    eventResizableFromStart
    ref={calendarRef}
    initialDate={date}
    initialView="timeGridWeek"
    dayMaxEventRows={3}
    eventDisplay="block"
    headerToolbar={false}
    slotMinTime={formatHour(bounds.heureDebutMin)}
    slotMaxTime={formatHour(bounds.heureFinMax)}
    slotLabelFormat={{
      hour: '2-digit',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: 'short',
    }}
    hiddenDays={[0]}
    dayHeaderFormat={{ weekday: 'long', month: 'numeric', day: 'numeric', omitCommas: true }}
    slotLabelInterval={{ hours: 1.5 }}
    eventOverlap={false}
    defaultAllDay={false}
    eventDurationEditable={false}
    allDaySlot={false}
    {...(selectedClassId ? { select: onSelectRange } : {})}
    height={smUp ? 720 : 'auto'}
    plugins={[
      listPlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
    ]}
    eventClick={handleEventClick}
  />
  </StyledCalendar>
  </Card> : 
  <Alert severity="info" sx={{ my: 2 }}>    Veuillez sélectionner un semestre pour afficher le calendrier
  </Alert>
}
<Menu
        anchorReference="anchorPosition"
        anchorPosition={{ top: menuPosition.top, left: menuPosition.left }}
        open={openMenu}
        onClose={onCloseMenu}
>
{userPermissions.includes('CREATE_COUR') && userPermissions.includes('DELETE_COUR') && (
  <MenuItem onClick={handleOpenWeekDialog}>
    Dupliquer
  </MenuItem>
)}        {userPermissions.includes('UPDATE_COUR') && (
  <MenuItem onClick={onOpenForm}>
    Modifier
  </MenuItem>
)}
 {userPermissions.includes('CREATE_COUR_ANNULE') && (
  <MenuItem onClick={handleCancelCourseMenu}>
    Annuler
  </MenuItem>
)} 
 
 {userPermissions.includes('DELETE_COUR') && (
  <MenuItem onClick={() => {
    setEventToDelete(selectEventId);
    onCloseMenu();  
    setConfirmDeleteOpen(true);
  }}>
    Supprimer
  </MenuItem>
)}
</Menu>
<Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
>
<DialogTitle>Confirmer la suppression</DialogTitle>
<DialogContent>
          Êtes-vous sûr de vouloir supprimer ce cours ?
</DialogContent>
<DialogActions>
<Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
<Button onClick={handleDeleteEvent} color="primary">Confirmer</Button>
</DialogActions>
</Dialog>
 
<Dialog
  open={openCancelDialog}
  onClose={() => {
    setOpenCancelDialog(false);
    setSelectedReason('');
    setCancellationDescription('');
  }}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>Annuler Cours</DialogTitle>
  <DialogContent>
    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
      <InputLabel id="motif-label">Motif</InputLabel>
      <Select
        labelId="motif-label"
        value={selectedReason || ''}
        onChange={(e) => {
          console.log('Motif sélectionné:', e.target.value);
          setSelectedReason(e.target.value);
        }}
        label="Motif"
      >
        {motifs.map((motif) => (
          <MenuItem key={motif.idmotif} value={motif.idmotif}>
            {motif.motif}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <Box sx={{ my: 2 }} />

    <TextField
      fullWidth
      label="Description"
      multiline
      rows={4}
      value={cancellationDescription}
      onChange={(e) => setCancellationDescription(e.target.value)}
    />

    {/* Afficher le CircularProgress pendant le chargement */}
    {loading && (
      <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
        <CircularProgress />
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => {
      setOpenCancelDialog(false);
      setSelectedReason('');
      setCancellationDescription('');
    }}>Annuler</Button>
    <Button onClick={handleCancelCourse} color="primary" disabled={loading}>
      {loading ? 'Chargement...' : 'Confirmer'}
    </Button>
  </DialogActions>
</Dialog>
 
<Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={() => {
          setSelectEventId('');
          onCloseForm();
      }}        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
>
<DialogTitle sx={{ minHeight: 76 }}>
          {openForm && (
<>
              {currentEvent?.id ? `Modifier Cour : ${currentEvent.title}` : 'Ajouter Cour'}
</>
          )}
</DialogTitle>
<CalendarForm
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={() => {
            setSelectEventId('');
            onCloseForm();
          }}
          onAddEvent={handleAddEvent}
          employeeId={selectedTeacherId}
          selectedModuleId={selectedModuleId}
          selectedClassId={selectedClassId}
          manuallySelectedWeeks={selectedWeeksManually}  // Nouvelle prop contenant la liste des semaines
 
         
        />
</Dialog>
 
 
<Dialog open={openWeekDialog} onClose={handleCloseWeekDialog}>
  {isLoading && <LinearProgress />} 
  <DialogTitle>Sélectionnez les Semaines</DialogTitle>
  <DialogContent>
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {weeks.map((week) => {
        const isConflict = selectedWeeks.includes(week.id);
        const isDisabled = disabledWeeks.includes(week.id);

        return (
          <FormControlLabel
            key={week.id}
            control={
              <Checkbox
                value={week.id}
                checked={isConflict}
                onChange={handleWeekChange}
                disabled={isDisabled || isLoading}
                title={isDisabled ? "Plage horaire partiellement ou totalement occupée par un autre module" : ""}
              />
            }
            label={week.label}
          />
        );
      })}
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseWeekDialog} color="primary" disabled={isLoading}>
      Fermer
    </Button>
  </DialogActions>
</Dialog>
 
 
<Dialog
  open={confirmUncheckOpen}
  onClose={() => setConfirmUncheckOpen(false)}
>
  <DialogTitle>Confirmation de suppression</DialogTitle>
  <DialogContent>
    Êtes-vous sûr de vouloir supprimer ce cours pour la semaine sélectionnée ?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmUncheckOpen(false)}>Annuler</Button>
    <Button
      onClick={() => {
        handleConfirmUncheck();
        setConfirmUncheckOpen(false); // Ferme la pop-up ici
      }}
      color="error"
      disabled={isLoading}
    >
      {isLoading ? <CircularProgress size={24} /> : 'Confirmer'}
    </Button>
  </DialogActions>
</Dialog>
</div>

</PermissionBasedGuard>
  );
}
CalendarView.propTypes = {};