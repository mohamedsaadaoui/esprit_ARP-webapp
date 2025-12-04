import * as Yup from 'yup';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import uuidv4 from 'src/utils/uuidv4';
import { isAfter, fTimestamp } from 'src/utils/format-time';

import salleService from 'src/services/emploi-services/salleService';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function CalendarForm({ currentEvent, colorOptions, onClose, onAddEvent, salleId }) {
  const { enqueueSnackbar } = useSnackbar();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [eventDataToSubmit, setEventDataToSubmit] = useState(null);

  const EventSchema = Yup.object().shape({
    description: Yup.string().max(5000, 'Description must be at most 5000 characters'),
    motifReservation: Yup.string()
    .max(255, 'Motif must be at most 255 characters')
    .required('Motif de réservation est obligatoire'), 
    start: Yup.mixed().required('Start date is required'),
    end: Yup.mixed().required('End date is required'),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: {
      description: currentEvent?.description || '',
      start: currentEvent?.start || null,
      end: currentEvent?.end || null,
      motifReservation: currentEvent?.title || '',    },
  });
  console.log('Current Event:', currentEvent);

  const { reset, watch, control, handleSubmit, formState: { isSubmitting } } = methods;
  const values = watch();
  const dateError = isAfter(values.start, values.end);

  const handleConfirmClose = () => {
    setOpenConfirmDialog(false);
  };

  const handleConfirm = async () => {
    try {
      if (!dateError) {
        const { start, end, description, motifReservation } = eventDataToSubmit; // added motifReservation

        const startDate = new Date(start);
        const endDate = new Date(end);

        const disponibilite = {
          salle: { id: Math.floor(salleId) },
          dateDebut: startDate.toISOString().split('T')[0],
          heureDebut: startDate.toTimeString().split(' ')[0],
          heureFin: endDate.toTimeString().split(' ')[0],
          motifReservation, 
        };

        console.log('Disponibilité à bloquer:', disponibilite);
        console.log('Salle ID:', salleId);

        if (currentEvent?.id) {
          // Modifier la disponibilité existante
          await salleService.modifierDisponibilite(currentEvent.id, {
            ...disponibilite,
            description,
          });
          enqueueSnackbar("Mise à jour réussie !");
          
          onAddEvent({
            id: currentEvent.id, 
            description,
            start,
            end,
            motifReservation, 
            display: "background",
            className: "indispo-background",
          });
        } else {
          console.log(salleId);
          // Créer un nouvel événement
          // eslint-disable-next-line no-restricted-globals
          if (salleId == null || isNaN(salleId)) {
            throw new Error('Invalid salleId provided');
          }

          console.log('salleId:', salleId); 
          await salleService.bloquerPlageHoraire(disponibilite, salleId);
          enqueueSnackbar("Création réussie !");
          
          const newEvent = {
            id: uuidv4(), 
            start,
            end,
            description,
            motifReservation,
            display: "background",  
            className: "indispo-background", 
          };
          
          onAddEvent(newEvent); 
        }

        onClose();
        reset();
      }
    } catch (error) {
      console.error("Erreur dans handleConfirm:", error);
      enqueueSnackbar(error.message || "Une erreur s'est produite lors de l'opération.", { variant: 'error' });
    } finally {
      handleConfirmClose();
    }
  };

  const onSubmit = handleSubmit((data) => {
    console.log(data.motifReservation); 
    const startDateTime = data?.start ? new Date(data.start) : null;
    const endDateTime = data?.end ? new Date(data.end) : null;
  
    if (!startDateTime || !endDateTime) {
      console.error("Start ou End date est invalide !");
      return;
    }
  
    const eventData = {
      id: currentEvent?.id || uuidv4(),
      description: data?.description,
      motifReservation: data?.motifReservation, 
      display: "background",
      className: "indispo-background", 
      end: data?.end,
      start: data?.start,
    };
  
    setEventDataToSubmit(eventData);
    setOpenConfirmDialog(true);
  });

 
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ px: 3 }}>
        <Controller
          name="start"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              value={new Date(field.value)}
              onChange={(newValue) => {
                if (newValue) {
                  field.onChange(fTimestamp(newValue));
                }
              }}
              label="Start date"
              format="dd/MM/yyyy hh:mm a"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          )}
        />

        <Controller
          name="end"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              value={new Date(field.value)}
              onChange={(newValue) => {
                if (newValue) {
                  field.onChange(fTimestamp(newValue));
                }
              }}
              label="End date"
              format="dd/MM/yyyy hh:mm a"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: dateError,
                  helperText: dateError && 'End date must be later than start date',
                },
              }}
            />
          )}
        />

        <RHFTextField name="description" label="Description" multiline rows={3} />
        <RHFTextField name="motifReservation" label="Motif de réservation" multiline rows={2} />
      </Stack>

      <Dialog open={openConfirmDialog} onClose={handleConfirmClose}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          {currentEvent?.id 
            ? "Êtes-vous sûr de vouloir modifier cette disponibilité ?" 
            : "Êtes-vous sûr de vouloir ajouter cette disponibilité ?"}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            Annuler
          </Button>
          <Button onClick={handleConfirm} color="primary">
            {currentEvent?.id ? "Enregistrer" : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      <DialogActions>
        {!!currentEvent?.id && (
          <Tooltip title="Supprimer l'événement" />
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Annuler
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError}
        >
        {currentEvent?.id ? "Enregistrer" : "Ajouter"}
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

CalendarForm.propTypes = {
  colorOptions: PropTypes.arrayOf(PropTypes.string),
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  onAddEvent: PropTypes.func,
  salleId: PropTypes.number.isRequired,
};