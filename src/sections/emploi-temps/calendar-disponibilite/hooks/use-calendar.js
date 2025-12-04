 
 
import { useRef, useState, useCallback } from 'react';
 
import { useResponsive } from 'src/hooks/use-responsive';
 
import { fTimestamp } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------
 
export default function useCalendar() {
  const calendarRef = useRef(null);
 
  const calendarEl = calendarRef.current;
 
  const smUp = useResponsive('up', 'sm');
 
  const [date, setDate] = useState(new Date());
 
  const [openForm, setOpenForm] = useState(false);
 
  const [openMenu, setOpenMenu] = useState(false);
 
  const [selectEventId, setSelectEventId] = useState('');
 
  const [selectedRange, setSelectedRange] = useState(null);
 
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const { userPermissions } = useAuthContext();
  const canCreate = userPermissions.includes('CREATE_DISPONIBILITE');

   const [view, setView] = useState(smUp ? 'timeGridWeek' : 'timeGridWeek');
   const canUpdate = userPermissions.includes('UPDATE_DISPONIBILITE');
  const canDelete = userPermissions.includes('DELETE_DISPONIBILITE');

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
    onCloseMenu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);
 
  const onOpenMenu = useCallback(() => {
    setOpenMenu(true);
  }, []);
 
  const onCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);
 
 
  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
 
      const newView = smUp ? 'timeGridWeek' : 'timeGridWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, smUp]);
 
  const onChangeView = useCallback(
    (newView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();
 
        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );
 
  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
 
      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);
 
  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
 
      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);
 
  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
 
      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);
 
  const onSelectRange = useCallback(
    (arg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        // Récupérez les événements chevauchant la plage sélectionnée
        const eventsInRange = calendarApi.getEvents().filter((event) => (
          (arg.start >= event.start && arg.start < event.end) || // Le début est dans un événement
          (arg.end > event.start && arg.end <= event.end) || // La fin est dans un événement
          (arg.start <= event.start && arg.end >= event.end) // L'événement est entièrement contenu
        ));

        // Vérifiez si un événement de type "background" est trouvé
        const backgroundEvent = eventsInRange.find((event) => event.display === "background");

        if (backgroundEvent) {
          if (canDelete || canUpdate) {
            setSelectEventId(backgroundEvent._def.publicId); // Enregistrez l'ID de l'événement sélectionné
            setMenuPosition({ top: arg.jsEvent.clientY + 5, left: arg.jsEvent.clientX + 5 });
            onOpenMenu();
            setSelectedRange({
              start: fTimestamp(arg.start),
              end: fTimestamp(arg.end),
            });

          }
          return;
        }
      }

      // Vérifiez si l'utilisateur a l'autorisation de créer
      if (canCreate) {
        onOpenForm();
        setSelectedRange({
          start: fTimestamp(arg.start),
          end: fTimestamp(arg.end),
        });
      } else {
        console.log("Vous n'avez pas l'autorisation de créer une disponibilité.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calendarEl, onOpenForm, canCreate]
  );
  const onClickEvent = useCallback(
    (arg) => {
      const { event } = arg;
 
      onOpenForm();
      setSelectEventId(event.id);
    },
    [onOpenForm]
  );
 
  const onResizeEvent = useCallback((arg, updateEvent) => {
    const { event } = arg;
 
    updateEvent({
      id: event.id,
      allDay: event.allDay,
      start: fTimestamp(event.start),
      end: fTimestamp(event.end),
    });
  }, []);
 
  const onDropEvent = useCallback((arg, updateEvent) => {
    const { event } = arg;
 
    updateEvent({
      id: event.id,
      allDay: event.allDay,
      start: fTimestamp(event.start),
      end: fTimestamp(event.end),
    });
  }, []);
 
  const onClickEventInFilters = useCallback(
    (eventId) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );
 
  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    openMenu,
    onOpenMenu,
    onCloseMenu,
    menuPosition,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  };
}
 