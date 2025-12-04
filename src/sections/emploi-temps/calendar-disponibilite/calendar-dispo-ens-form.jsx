import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import uuidv4 from 'src/utils/uuidv4';
import { isAfter, fTimestamp } from 'src/utils/format-time';

import dispEnseignantService from 'src/services/emploi-services/dispEnseignantService';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function CalendarForm({ currentEvent, colorOptions, onClose, onAddEvent, employeeId,fetchDisponibilites  }) {
  const { enqueueSnackbar } = useSnackbar();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [eventDataToSubmit, setEventDataToSubmit] = useState(null);

  const EventSchema = Yup.object().shape({
    description: Yup.string().max(5000, 'Description must be at most 5000 characters'),
    color: Yup.string(),
    start: Yup.mixed().required('Start date is required'),
    end: Yup.mixed().required('End date is required'),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: currentEvent || {
      description: '',
      start: null,
      end: null,
    },
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const dateError = isAfter(values.start, values.end);

  const handleConfirmClose = () => {
    setOpenConfirmDialog(false);
  };

  const handleConfirm = async () => {
    try {
      if (!dateError) {
        const { start, end, description } = eventDataToSubmit;
        const startDate = new Date(start);
        const endDate = new Date(end);
  
        const disponibilite = {
          employe: { id: Math.floor(employeeId) },
          dateDebut: startDate.toISOString().split('T')[0],
          heureDebut: startDate.toTimeString().split(' ')[0],
          heureFin: endDate.toTimeString().split(' ')[0],
        };
  
        if (currentEvent?.id) {
          await dispEnseignantService.modifierDisponibilite(currentEvent.id, {
            ...disponibilite,
            description,
          });
          enqueueSnackbar("Mise à jour réussie !");
          
          onAddEvent({
            id: currentEvent.id, 
            description,
            start,
            end,
            display: "background",
            className: "indispo-background",
          });
        } else {
          await dispEnseignantService.bloquerPlageHoraire(disponibilite, employeeId);
          enqueueSnackbar("Création réussie !");
          
          const newEvent = {
            id: uuidv4(), 
            start,
            end,
            description,
            display: "background",  
            className: "indispo-background", 
          };
          
          onAddEvent(newEvent); 
        }
  
        // Call fetchDisponibilites after adding/updating an event
        fetchDisponibilites(employeeId);
  
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
    const startDateTime = data?.start ? new Date(data.start) : null;
    const endDateTime = data?.end ? new Date(data.end) : null;

    if (!startDateTime || !endDateTime) {
      console.error("Start ou End date est invalide !");
      return;
    }

    const eventData = {
      id: currentEvent?.id || uuidv4(),
      description: data?.description,
      display: "background",
      className: "indispo-background", 
      end: data?.end,
      start: data?.start,
    };

    setEventDataToSubmit(eventData);
    setOpenConfirmDialog(true);
  });

  const onDelete = useCallback(async () => {
    try {
      await dispEnseignantService.supprimerPlageHoraire(currentEvent?.id);
      enqueueSnackbar('Suppression réussie !');
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [currentEvent?.id, enqueueSnackbar, onClose]);

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
          <Tooltip title="Supprimer l'événement">
            <IconButton onClick={onDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
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
  employeeId: PropTypes.number.isRequired, 
  fetchDisponibilites: PropTypes.func.isRequired, 

};