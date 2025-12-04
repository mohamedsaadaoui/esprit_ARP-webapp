import { addDays } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useTheme } from '@emotion/react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useState, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

import Card from '@mui/material/Card';
import { Menu, Dialog, Button, MenuItem, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useAuthContext } from 'src/auth/hooks';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock';
import { useGlobalData } from 'src/globalDataProvider';
import courService from 'src/services/emploi-services/courService';
import enseignantService from 'src/services/emploi-services/enseignantService';
import dispEnseignantService from 'src/services/emploi-services/dispEnseignantService';

import './style.css';
import { StyledCalendar } from '../styles';
import { useEvent, useCalendar } from '../hooks';
import CalendarForm from '../calendar-dispo-ens-form';
import CalendarToolbar from '../calendar-dispo-ens-toolbar';


export default function CalendarView() {
        const smUp = useResponsive('down', 'sm');
  const openFilters = useBoolean();
  const [events, setEvents] = useState([]);
    const [ setEmployeeId] = useState(null);
  
  const [selectedTeacherId, setSelectedTeacherId] = useState(''); // Ajout de l'état pour l'ID de l'enseignant
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { idEmp } = useParams(); 
  const [employeeName, setEmployeeName] = useState('');
  const { userPermissions } = useAuthContext();
  const [loadingCour, setLoadingCour] = useState(false);
  const canUpdate = userPermissions.includes('UPDATE_DISPONIBILITE');
  const canDelete = userPermissions.includes('DELETE_DISPONIBILITE');
  const handleAddEvent = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

    const { semestreSelectionne, semestres, anneeSelectionne, cursusSelectionne} = useGlobalData(); // Récupérez les données globales 
    // eslint-disable-next-line no-shadow
    const findSemestreById = (semestreSelectionneId, semestres) => semestres.find(semestre => semestre.id === semestreSelectionneId);
    const semestreCorrespondant = findSemestreById(semestreSelectionne, semestres);
  

  useEffect(() => {
    if (idEmp) {
      fetchDisponibilites(idEmp, setEvents);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    menuPosition,
    onCloseMenu,
    selectEventId,
    selectedRange,
  } = useCalendar(holidays);

  const currentEvent = useEvent(events, selectEventId, selectedRange, openForm);

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  const handleEventClick = (info) => {
    // Si c'est une indisponibilité, ouvrir le menu de suppression
    if (info.event.extendedProps.type === "indispo") {
      // eslint-disable-next-line no-undef
      setAvailabilityToDelete(info.event.id);
      // eslint-disable-next-line no-undef
      setConfirmAvailabilityDeleteOpen(true);
      return;
    }
    
    if (info.event.extendedProps.type === "Cours") {
      return;
    }
    
    onOpenForm();
  };
 

  const fetchDisponibilites = async (id) => {
    setLoadingCour(true);
    try {
      const disponibilites = await dispEnseignantService.listerDisponibilitesParEnseignant(id);
      return disponibilites.map((disponibilite) => ({
        start: `${disponibilite.dateDebut}T${disponibilite.heureDebut}`,
        end: `${disponibilite.dateDebut}T${disponibilite.heureFin}`,
        id: disponibilite.id,
        display: 'background',
        className: 'indispo-background',
        type: "indispo",
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des disponibilités:', error);
      return [];
    } finally {
      setLoadingCour(false);
    }
  };

  useEffect(() => {
    const loadDisponibilites = async () => {
      if (idEmp) {
        const disponibilites = await fetchDisponibilites(idEmp);
        setEvents((prevEvents) => [...prevEvents, ...disponibilites]);
      }
    };

    loadDisponibilites();
  }, [idEmp]);

  const fetchCours = async () => {
    setLoadingCour(true)
    try {
      const cours = await courService.listerCoursActifParEnseignant(idEmp);
      const formattedEvents = cours.map((cour) => {
        const classCursus = cour.classeSemestres[0]?.idClasse.cursus?.id;
        const isMatchingCursus = classCursus === cursusSelectionne;
  
        return {
          start: `${cour.datecours}T${cour.idplagehoraire.heureDebut}`,
          end: `${cour.datecours}T${cour.idplagehoraire.heureFin}`,
          id: cour.id,
          title: `${cour.modules[0]?.designation || 'Sans désignation'} - ${cour.classeSemestres[0]?.idClasse.nomClasse || 'Classe inconnue'}`,
          // eslint-disable-next-line no-nested-ternary
          textColor: cour.ratrappage 
          ? (isMatchingCursus ? "#2e86c1" : "#aed6f1") 
          : (isMatchingCursus ? "Red" : "#fcbdb0"),     
               className: `${cour.ratrappage ? 'cour-background-annule rattrapage-border' : 'cour-background'} ${isMatchingCursus ? 'matching-cursus' : 'non-matching-cursus'}`,
          plageHoraire: cour.idplagehoraire.id,
          salle : cour.salles[0],
          type: "Cours",
          // eslint-disable-next-line object-shorthand
          isMatchingCursus: isMatchingCursus, 
        };
      });
      return formattedEvents;
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
      return [];
    }
    finally {
      setLoadingCour(false); // Fin du chargement dans tous les cas
    }
  }; 

  // Fetch employee details
const fetchEmployeeDetails = async () => {
  try {
    const employee = await enseignantService.getEnseignantById(idEmp);
    setEmployeeName(`${employee.nom} ${employee.prenom}`); // Assuming employee object has nom and prenom
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employé:', error);
  }
};

const fetchAllEvents = async () => {
  if (idEmp) {
    await fetchEmployeeDetails();
    
    const disponibilites = await fetchDisponibilites(idEmp);
    const cours = await fetchCours(idEmp);
    setEvents([...disponibilites, ...cours]);
  }
};

useEffect(() => {

  fetchAllEvents();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [idEmp]);


const handleDeleteEvent = async () => {
  if (!eventToDelete) {
    enqueueSnackbar('Aucun événement sélectionné pour la suppression.', { variant: 'warning' });
    return;
  }

  try {
    await dispEnseignantService.supprimerPlageHoraire(eventToDelete);
    
    // Refresh disponibilites after deletion
    fetchAllEvents();
    enqueueSnackbar('Suppression réussie!', { variant: 'success' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    enqueueSnackbar('Erreur lors de la suppression de l\'événement.', { variant: 'error' });
  } finally {
    setConfirmDeleteOpen(false);
    onCloseMenu();
  }
};

  const handleSelectEnseignant = (selectedId) => {
    setEmployeeId(selectedId);
    setSelectedTeacherId(selectedId); // Met à jour l'ID de l'enseignant sélectionné
    console.log('Enseignant sélectionné ID:', selectedId); // Affiche l'ID dans la console
  };

  return (
    <div className="calendar-view">
      <Card>
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
            selectedTeacherId={selectedTeacherId} // Ajout de la prop ici
            employeeName={employeeName} // Add this line
          />
  
          <Calendar
           
          validRange={{
          start: semestreCorrespondant?.dateDebut ,
                end: addDays(new Date(semestreCorrespondant?.dateFin), 1),
          }}
            weekends
            editable
            droppable
            selectable
            rerenderDelay={10}
            allDayMaintainDuration
            eventResizableFromStart
            ref={calendarRef}
            initialDate={date}
            initialView="timeGridWeek"
            dayMaxEventRows={3}
            eventDisplay="block"
            events={events}
            headerToolbar={false}
            slotMinTime="09:00"
            slotMaxTime="18:00"
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
            eventDurationEditable
            allDaySlot={false}
            select={onSelectRange}
            height={smUp ? 720 : 'auto'}
            plugins={[
              listPlugin,
              dayGridPlugin,
              timelinePlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            eventClick={handleEventClick}
          />
        </StyledCalendar>
      </Card>
      <Menu
      anchorReference="anchorPosition"
      anchorPosition={{ top: menuPosition.top, left: menuPosition.left }}
      open={openMenu}
      onClose={onCloseMenu}
    >
      {canUpdate && (
        <MenuItem onClick={onOpenForm}>Modifier</MenuItem>
      )}
      {canDelete && (
        <MenuItem
          onClick={() => {
            setEventToDelete(selectEventId);
            setConfirmDeleteOpen(true);
          }}
        >
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
          Êtes-vous sûr de vouloir supprimer cet événement ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteEvent} color="primary">Confirmer</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.id ? 'Modifier Disponibilité' : 'Ajouter Disponibilité'}</>}
        </DialogTitle>
        <CalendarForm
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseForm}
          onAddEvent={handleAddEvent}
          employeeId={idEmp} 
          fetchDisponibilites={fetchAllEvents} 
        />
      </Dialog>
    </div>
  );
}

CalendarView.propTypes = {};