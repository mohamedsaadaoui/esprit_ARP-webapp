import jsPDF from 'jspdf';
import { addDays } from 'date-fns';
import html2canvas from 'html2canvas';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useTheme } from '@emotion/react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useState, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import { Menu,  Alert, Dialog, Button, MenuItem,  DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useAuthContext } from 'src/auth/hooks';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock';
import { useGlobalData } from 'src/globalDataProvider';
import courService from 'src/services/emploi-services/courService';
import salleService from 'src/services/emploi-services/salleService';
import vacanceService from 'src/services/emploi-services/vacanceService';
import PermissionBasedGuard from 'src/auth/guard/permession-based-guard';
import jourFerieService from 'src/services/emploi-services/jourFerrieService';

import './style.css';
import CalendarToolbar from '../calendar-salle-toolbar'; // Ensure to import the service

import { StyledCalendar } from '../styles';
import { useEvent, useCalendar } from '../hooks';
import CalendarForm from '../calendar-salle-form';
 
 
export default function CalendarView() {
  const smUp = useResponsive('down', 'sm');
  const openFilters = useBoolean();
  const [events, setEvents] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [salleId, setSalleId] = useState(null);
  const [selectedSalleId, setSelectedSalleId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');  // État pour la classe sélectionnée
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [selectEventId, setSelectEventId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [attachmentPath, setAttachmentPath] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [refreshData, setRefreshData] = useState(false);
  const [setAvailabilityToDelete] = useState(null);
  const [setConfirmAvailabilityDeleteOpen] = useState(false);
   const [setSelectedWeeks] = useState([]);
const { semestreSelectionne, semestres ,anneeSelectionne ,cursusSelectionne} = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres
const { userPermissions } = useAuthContext();
   const [selectedWeeksManually] = useState([]);
   const { idSalle } = useParams(); 
   useEffect(() => {
    if (idSalle) {
      // eslint-disable-next-line no-undef
      getCoursBySalle(idSalle, setEvents);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);






  const [slotMinTime, setSlotMinTime] = useState("08:00");
const [slotMaxTime, setSlotMaxTime] = useState("18:00");



   
   useEffect(() => {
   
     console.log("Liste des semaines manuellement sélectionnées dans CalendarView:", selectedWeeksManually);
   
   }, [selectedWeeksManually]);
  // eslint-disable-next-line no-shadow
  const findSemestreById = (semestreSelectionneId, semestres) => semestres.find(semestre => semestre.id === semestreSelectionneId);
  const semestreCorrespondant = findSemestreById(semestreSelectionne, semestres);
  // console.log('id du semestre sélectionné :', semestreCorrespondant.id);
  // console.log('Date de début du semestre sélectionné :', semestreCorrespondant.dateDebut);



  // eslint-disable-next-line no-shadow
  const fetchCours = async (idSalle) => {
    try {
      // Récupération en parallèle des cours et des plages horaires
      const [cours, bounds] = await Promise.all([
        courService.getCoursBySalleActif(idSalle),
        courService.getBoundsSalleByCursusId(idSalle)
      ]);
  
      // Formatage des heures min/max (si nécessaire pour votre calendrier)
      const minTime = `${bounds.heureDebutMin.toString().padStart(2, '0')}:00`;
      const maxTime = `${bounds.heureFinMax.toString().padStart(2, '0')}:00`;
      setSlotMinTime(minTime);
      setSlotMaxTime(maxTime);
  
      const formattedEvents = cours.map((cour) => {
        const classCursus = cour.classeSemestres[0]?.idClasse.cursus?.id;

      const isMatchingCursus = classCursus === cursusSelectionne;

      return {
        start: `${cour.datecours}T${cour.idplagehoraire.heureDebut}`,
        end: `${cour.datecours}T${cour.idplagehoraire.heureFin}`,
        id: cour.id,
        title: `${cour.modules[0]?.designation || 'Sans désignation'} - ${cour.classeSemestres[0]?.idClasse.idClasse || 'Classe inconnue'}`,
        className: `${isMatchingCursus ? 'matching-cursus' : 'non-matching-cursus'}`,
        textColor: (isMatchingCursus ? "Red" : "#fcbdb0"),
        
        extendedProps: {
          plageHoraire: cour.idplagehoraire,
          salleId: idSalle
        }
    }});
  
      return formattedEvents;
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return [];
    }
  };
 

// eslint-disable-next-line no-shadow
const fetchDisponibilites = async (salleId) => {
  try {
    const disponibilites = await salleService.getDisponibiliteBySalleId(salleId);
    const formattedEvents = disponibilites.map((disponibilite) => ({
      start: `${disponibilite.dateDebut}T${disponibilite.heureDebut}`,
      end: `${disponibilite.dateDebut}T${disponibilite.heureFin}`,
      title: disponibilite.motifReservation || 'Sans titre',
      id: disponibilite.id,
      className: 'cour-background-salle',
      textColor: "Violet",
      type : "Reservation"
    }));

    return formattedEvents; // Retournez les événements formatés
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités :', error);
    return []; // Retournez un tableau vide en cas d'erreur
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

const fetchData = async () => {
  try {
    const joursFeriesEvents = await fetchJoursFeries(anneeSelectionne); 
    const vacancesEvents = await fetchVacances(cursusSelectionne);

    let allEvents = [];

    if (salleId) {
      const coursEvents = await fetchCours(salleId);
      const disponibilitesEvents = await fetchDisponibilites(salleId); 

      allEvents = [
        ...coursEvents,
        ...disponibilitesEvents,
        ...joursFeriesEvents,
        ...vacancesEvents,
      ];
    } else {
      allEvents = [...joursFeriesEvents, ...vacancesEvents];
    }

    setEvents(allEvents);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
  }
};

useEffect(() => {
  fetchData();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [salleId]);

  useEffect(() => {
    setEvents([]);
    setSalleId("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursusSelectionne]);

  
  // Fonction pour ajouter un événement
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
    // Check for update permission
    if (info.event.extendedProps.type === "Reservation") {
      if (userPermissions.includes('UPDATE_RESERVATION')) {
        setSelectEventId(info.event.id);
        setMenuPosition({ top: info.jsEvent.clientY + 5, left: info.jsEvent.clientX + 5 });
        onOpenMenu();
      }

      else if (userPermissions.includes('DELETE_RESERVATION')) {
        setSelectEventId(info.event.id);
        setMenuPosition({ top: info.jsEvent.clientY + 5, left: info.jsEvent.clientX + 5 });
        onOpenMenu();
        setAvailabilityToDelete(info.event.id);
        setConfirmAvailabilityDeleteOpen(true);
      }
    } 
  };
 
  
  const handleDeleteEvent = async () => {
    if (!eventToDelete) {
      enqueueSnackbar('Aucun événement sélectionné pour la suppression.', { variant: 'warning' });
      return;
    }

    try {
      // Supprimer l'événement du backend
      await salleService.supprimerDisponibilite(eventToDelete);
        fetchData();
 
      // Afficher un message de succès
      enqueueSnackbar('Suppression réussie!', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      enqueueSnackbar('Erreur lors de la suppression de l\'événement.', { variant: 'error' });
    } finally {
      setConfirmDeleteOpen(false);
      onCloseMenu();
    }
  };
 
  // useEffect pour rafraîchir les données
  useEffect(() => {
    if (salleId && refreshData) {
      fetchCours(salleId, setEvents);
      fetchDisponibilites(employeeId, setEvents);
      setRefreshData(false); // Réinitialiser l'état de rafraîchissement
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salleId, refreshData]);
 
  // useEffect initial pour charger les données au montage du composant
  useEffect(() => {
    if (salleId) {
      fetchCours(salleId, setEvents);
      fetchDisponibilites(employeeId, setEvents);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salleId]);
 
 
  const handleSelectEnseignant = (selectedId) => {
    setEmployeeId(selectedId);
    setSelectedTeacherId(selectedId);
    setEvents([]); // Réinitialiser les événements
    console.log('Enseignant sélectionné ID:', selectedId);
  };
 
  const fetchJoursFeries = async (anneeUniversitaireId) => {
    try {
      const joursFeries = await jourFerieService.getAllJoursFeries(anneeUniversitaireId);
      const formattedHolidays = joursFeries.map((jour) => {
        const start = `${jour.dateDebut}T00:00:00`;
        const dateDebut = new Date(jour.dateDebut);
        const dateFin = new Date(jour.dateFin);
   
        let end;
        if (dateDebut.toISOString().split('T')[0] === dateFin.toISOString().split('T')[0]) {
          end = `${jour.dateDebut}T23:59:59`;
        } else {
          end = `${jour.dateFin}T00:00:00`;
          end = new Date(new Date(end).getTime() - 1 * 60 * 1000).toISOString();
        }
   
        return {
          // eslint-disable-next-line object-shorthand
          start: start,
          end: new Date(end).toISOString(),
          title: `Jour Férié - ${jour.nom || ''}`,
          className: 'cours-dispo', // Classe pour le style des jours fériés
          textColor: "Gray", // Couleur du texte pour les jours fériés
        };
      });
      return formattedHolidays; // Retourner les événements formatés pour les jours fériés
    } catch (error) {
      console.error('Erreur lors de la récupération des jours fériés:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  };
   

  // eslint-disable-next-line no-shadow
  const yourSelectSalleFunction = (salleId) => {
    setSalleId(salleId);
    setSelectedSalleId(salleId)
    setEvents([]);
    console.log("Selected Salle ID: ", salleId);
    // Perform actions with the selected salle ID
  };

  
  useEffect(() => {
    if (salleId) {
      fetchCours(salleId, setEvents);
      // fetchDisponibilites(employeeId, setEvents); // Appeler les disponibilités ici aussi
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salleId]);
 

  const handleSelectModule = (selectedId) => {
    setSelectedModuleId(selectedId);
    console.log('Module sélectionné ID:', selectedId);
  };
 
  const handleSelectClass = (selectedId) => {  // Fonction pour sélectionner une classe
    setSelectedClassId(selectedId);
    console.log('Classe sélectionnée ID:', selectedId); // Affiche l'ID de la classe sélectionnée
  };
 
 
  const handlePrint = async () => {
    const printContent = document.querySelector('.calendar-view');
    if (printContent) {
      const canvas = await html2canvas(printContent, {
        scale: 2,
        backgroundColor: '#FFFFFF'
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
 
      // Changer l'orientation en paysage si nécessaire
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' pour paysage, 'p' pour portrait
      const imgWidth = 297; // Largeur de la page A4 en paysage
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
 
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
 
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
 
      const fileName = `file_${new Date().getTime()}.pdf`;
      const generatedAttachmentPath = `C:\\Users\\Esprit\\Downloads\\${fileName}`;
      pdf.save(fileName);
      setAttachmentPath(generatedAttachmentPath);
 
     // console.log("generated : ",x)
    } else {
      console.error("Le contenu à imprimer n'a pas été trouvé.");
    }
  };
 
 
 
  return (

    <PermissionBasedGuard permissions={['VIEW_COUR_SALLE']}hasContent>

    
    <div className="calendar-view">
 
 {
  semestreCorrespondant ? 
  <Card>
  <StyledCalendar>
    <CalendarToolbar
      date={date}
      view={view}
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
      handlePrint={handlePrint}
      attachmentPath={attachmentPath}
      onSelectedWeeksChange={setSelectedWeeks}
      onSelectSalle={yourSelectSalleFunction}

    />

    <Calendar

validRange={{
start: semestreCorrespondant.dateDebut ,
      end: addDays(new Date(semestreCorrespondant.dateFin), 1),
      
    }}

   
    events={events}
      weekends
      editable={false}
      droppable={false}boundsEns
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
      slotMinTime={slotMinTime}
      slotMaxTime={slotMaxTime}
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
      {...(selectedSalleId ? { select: onSelectRange } : {})}
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
</Card>
:
<Alert severity="info" sx={{ my: 2 }}>    Veuillez sélectionner un semestre pour afficher le calendrier
</Alert>
 }
     <Menu
  anchorReference="anchorPosition"
  anchorPosition={{ top: menuPosition.top, left: menuPosition.left }}
  open={openMenu}
  onClose={onCloseMenu}
>
  {userPermissions.includes('UPDATE_RESERVATION') && (
    <MenuItem onClick={onOpenForm}>Modifier</MenuItem>
  )}
  {userPermissions.includes('DELETE_RESERVATION') && (
    <MenuItem onClick={() => {
      setEventToDelete(selectEventId);
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
  <DialogTitle>Confirmation de Suppression</DialogTitle>
  <DialogContent>
    Êtes-vous sûr de vouloir supprimer cet événement ?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
    <Button onClick={handleDeleteEvent} color="error">
      Supprimer
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
              {currentEvent?.id ? `Modifier Réservation : ${currentEvent.title}` : 'Réserver Salle'}
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
          manuallySelectedWeeks={selectedWeeksManually}
          salleId={selectedSalleId} 
          // Nouvelle prop contenant la liste des semaines
 
        />
      </Dialog>
 
 
     
  
 
 
</div>
</PermissionBasedGuard>
  );
}
 
CalendarView.propTypes = {};