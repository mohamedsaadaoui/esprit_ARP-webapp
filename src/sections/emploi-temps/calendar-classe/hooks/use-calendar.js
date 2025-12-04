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
  const { userPermissions } = useAuthContext();

  const [selectedRange, setSelectedRange] = useState(null);
 
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
 
   const [view, setView] = useState(smUp ? 'timeGridWeek' : 'timeGridWeek');
 
  const onOpenForm = useCallback(() => {
    setOpenForm(true);
    onCloseMenu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
    console.log ("test")
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
 
  const normalizeEvent = (event) => ({
    id: event._def.publicId,
    title: event._def.title,
    start: event.startStr,
    end: event.endStr,
    display: event._def.ui.display || 'standard',
    className: event._def.ui.classNames.join(' '),
  });
 
  const onSelectRange = useCallback(
    (arg) => {
      // Check for permission before proceeding
      if (!userPermissions.includes('CREATE_COUR')) {
        return; // Exit the function if the permission is not granted
      }
  
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();
  
        // Récupérez les événements chevauchant la plage sélectionnée
        const eventsInRange = calendarApi.getEvents().filter((event) => (
          (arg.start >= event.start && arg.start < event.end) || 
          (arg.end > event.start && arg.end <= event.end) ||  
          (arg.start <= event.start && arg.end >= event.end) 
        ));
  
        // Si nous trouvons des événements dans la plage sélectionnée
        if (eventsInRange.length > 0) {
          const firstEvent = normalizeEvent(eventsInRange[0]);
 
          // Vérifiez si l'événement a un display de type 'background'
          if (firstEvent.display === 'background') {
            return; // Ne pas ouvrir le menu si l'événement est de type 'background'
          }
          
          
          // Prenez le premier événement de la liste
          setSelectEventId(firstEvent._def.publicId); // Enregistrez l'ID de l'événement sélectionné
          setMenuPosition({ top: arg.jsEvent.clientY + 5, left: arg.jsEvent.clientX + 5 });
          onOpenMenu(); // Ouvrir le menu
          setSelectedRange({
            start: fTimestamp(arg.start),
            end: fTimestamp(arg.end),
          });
          return; // Sortir de la fonction
        }
      }
  
      // Continuez avec la logique d'ouverture du formulaire si aucun événement n'est sélectionné
      onOpenForm();
      setSelectedRange({
        start: fTimestamp(arg.start),
        end: fTimestamp(arg.end),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calendarEl, onOpenForm, userPermissions] // Add userPermissions to the dependency array
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