import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
 
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
 
import uuidv4 from 'src/utils/uuidv4';
import { fTimestamp } from 'src/utils/format-time';
 
import { useGlobalData } from 'src/globalDataProvider';
import courService from 'src/services/emploi-services/courService';
import planningService from 'src/services/emploi-services/planningService';
import plageHoraireService from 'src/services/emploi-services/plageHoraireService';
 
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { format } from 'date-fns';
 
export default function CalendarForm({
  currentEvent,
  colorOptions,
  onClose,
  onAddEvent,
  employeeId,
  selectedModuleId,
  selectedClassId,
  // eslint-disable-next-line react/prop-types
  manuallySelectedWeeks,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [eventDataToSubmit, setEventDataToSubmit] = useState(null);
  const [plagesHoraires, setPlagesHoraires] = useState([]);
  const [selectedPlageHoraire, setSelectedPlageHoraire] = useState('');
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState([]);
  const [sallesDisponibles, setSallesDisponibles] = useState([]);
  const [selectedSalleId, setSelectedSalleId] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const {cursusSelectionne} = useGlobalData();
  const [newPlageHoraire, setNewPlageHoraire] = useState(currentEvent?.plageHoraire || '');
  const [newSalle, setNewSalle] = useState(currentEvent?.salle?.id || null);
 
 
  const EventSchema = Yup.object().shape({
    description: Yup.string().max(5000, 'Description must be at most 5000 characters'),
    color: Yup.string(),
    start: Yup.mixed().required('Start date is required'),
    plageHoraire: Yup.string().required('Plage horaire est requise'),
    module: Yup.string().nullable(),
    classeSemestre: Yup.string().required('Classe est requise'),
    salle: Yup.string().nullable(), 
  });
 
  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: {
      description: currentEvent?.description || '',
      start: currentEvent?.start || null,
      plageHoraire: currentEvent?.plageHoraire || '',
      module: currentEvent?.module || selectedModuleId || '',
      classeSemestre: selectedClassId || '',
    },
  });
 
  const { reset, watch, control, handleSubmit, formState: { isSubmitting } } = methods;
 
  const loadPlagesHoraires = async () => {
    try {
      const data = await plageHoraireService.listerActivesPlagesHorairesParCursus(cursusSelectionne); // Assurez-vous que cursusSelectionne a bien un id
      setPlagesHoraires(data);
    } catch (error) {
      console.error('Erreur lors du chargement des plages horaires:', error);
    }
  };
  const loadModulesByClassAndYear = async () => {
    try {
      const data = await planningService.getPlanningByIdClasse(selectedClassId);
      console.log("Modules chargés:", data);
      
      const modulesList = data.map(item => ({
        id: item.idModule,
        designation: `${item.designation} - ${item.employes.map(emp => emp.nomCompletEmploye).join(', ')}`,
        employes: item.employes,
        nbHeureAdd: item.nbHeureAdd,
        chargeH: item.chargeH,
      }));
  
      setModules(modulesList);
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
    }
  };
 
  const loadSallesDisponibles = async (idPlageHoraire, dateCours) => {
    try {
        const data = await courService.getSallesDisponiblesByCursus(cursusSelectionne, idPlageHoraire, dateCours);
        
        if (
            currentEvent?.salle &&
            !data.some(salle => salle.id === currentEvent.salle.id)
        ) {
            data.push(currentEvent.salle);
        }
        
        setSallesDisponibles(data);
        console.log(currentEvent?.salle);
    } catch (error) {
        console.error('Erreur lors du chargement des salles disponibles :', error);
    }
};
 
  useEffect(() => {
    loadPlagesHoraires();

    loadModulesByClassAndYear();
    if (currentEvent) {
        reset({
            description: currentEvent.description || '',
            start: currentEvent.start || null,
            plageHoraire: currentEvent.plageHoraire || '', // Assure que la plage horaire existante est sélectionnée
            module: currentEvent.module || selectedModuleId || '',
            classeSemestre: selectedClassId || '',
            salle: currentEvent.salle ? currentEvent.salle.id : null // Ajout pour s'assurer que la salle existante est sélectionnée
        });
        setSelectedPlageHoraire(currentEvent.plageHoraire); // Set selected plage horaire
        if (currentEvent.plageHoraire) {
          const dateCours = new Date(currentEvent.start).toISOString().split("T")[0];
            loadSallesDisponibles(currentEvent.plageHoraire, dateCours);
        }
        if (currentEvent.salle) {
          setSelectedSalleId(currentEvent.salle.id); // Nouvelle ligne pour la salle
        }
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentEvent, reset, selectedModuleId]);
 
const handlePlageHoraireChange = async (event) => {
  const selectedId = event.target.value;
  setSelectedPlageHoraire(selectedId);
  const startDate = watch("start");

  if (startDate) {
    const dateCours = new Date(startDate).toISOString().split("T")[0];
    await loadSallesDisponibles(selectedId, dateCours);
  }
};

const handleDateChange = async (newValue) => {
  const selectedId = selectedPlageHoraire; 
  if (newValue) {
    const dateCours = newValue.toISOString().split("T")[0];
    await loadSallesDisponibles(selectedId, dateCours);
  }
};

  const handleSalleChange = (event, field) => {
    // eslint-disable-next-line no-shadow
    const selectedSalleId = event.target.value;
    // field.onChange(selectedSalleId);
    setSelectedSalleId(selectedSalleId);
  };
  
 
  const handleModuleChange = (event, field) => {
    // eslint-disable-next-line no-shadow
    const selectedModuleId = event.target.value;
    field.onChange(selectedModuleId);
    setModuleId(selectedModuleId);
 
    const selectedModule = modules.find(mod => mod.id === selectedModuleId);
    if (selectedModule) {
      setSelectedEmployeeIds(selectedModule.employes.map(emp => emp.idEmploye)); // Récupérez tous les IDs des employés
    } else {
      setSelectedEmployeeIds([]); // Réinitialisez si aucun module n'est sélectionné
    }
  };
 
 
  const handleConfirmClose = () => {
    setOpenConfirmDialog(false);
  };
 
  const handleConfirm = async () => {
    try {
      const { start, description, module } = eventDataToSubmit;
      const startDate = new Date(start);
  
      // eslint-disable-next-line no-restricted-globals
      if (!startDate || isNaN(startDate.getTime())) {
        throw new Error("La date du cours ne peut pas être nulle.");
      }
  
      const cours = {
        description,
        datecours: startDate.toISOString().split("T")[0],
        classeSemestres: [{ id: selectedClassId }],
        modules: (module || selectedModuleId) ? [{ id: module || selectedModuleId }] : [],
        employes: selectedEmployeeIds.map(id => ({ id })),
        idplagehoraire: { id: selectedPlageHoraire },
        salles: selectedSalleId ? [{ id: selectedSalleId }] : []
      };
  
      if (currentEvent?.id) {
        await courService.modifierCour(currentEvent.id, cours);
        enqueueSnackbar("Mise à jour réussie !", { variant: "success", autoHideDuration: 2000 });
  
        onAddEvent({
          id: currentEvent.id,
          description,
          start: startDate.toISOString(),
          display: "background",
          className: "indispo-background",
        });
      } else {
        try {
          await courService.ajouterCour(cours, selectedPlageHoraire);
  
          // 🟢 Snackbar immédiate pour création
          enqueueSnackbar(` ${startDate.toISOString().split("T")[0]} Le cours a été créer avec succès`, {
            variant: "success",
            autoHideDuration: 2000
          });
  
          onAddEvent({
            id: uuidv4(),
            start: startDate.toISOString(),
            description,
            className: "indispo-background",
          });
  
          // 🔁 Duplication
          // eslint-disable-next-line react/prop-types
          if (manuallySelectedWeeks.length > 0) {
            const duplicationResponse = await courService.dupliquerCoursSurPlusieursSemaines(
              cours,
              manuallySelectedWeeks,
              selectedPlageHoraire
            );
  
            if (duplicationResponse && Array.isArray(duplicationResponse.duplique)) {
              // eslint-disable-next-line no-plusplus
              for (let i = 0; i < duplicationResponse.duplique.length; i++) {
                const { date, status, message } = duplicationResponse.duplique[i];
  
                // ⏳ Attendre 1 seconde entre chaque snackbar
                // eslint-disable-next-line no-await-in-loop
                await new Promise(resolve => setTimeout(resolve, 1000));
  
                enqueueSnackbar(`${date} - ${message}`, {
                  variant: status === "succes" ? "success" : "error",
                  autoHideDuration: 2000
                });
  
                // 🎯 Ajouter à l'UI si duplication réussie
                if (status === "succes") {
                  onAddEvent({
                    id: uuidv4(),
                    start: date,
                    description,
                    className: "indispo-background"
                  });
                }
              }
            }
          }
        } catch (error) {
          const errorMessage = error?.response?.data || error || "Une erreur s'est produite";
          enqueueSnackbar(errorMessage, { variant: "error", autoHideDuration: 2000 });
        }
      }
  
      onClose();
      reset();
    } catch (error) {
      const errorMessage = error?.response?.data || error || "Une erreur s'est produite";
      enqueueSnackbar(errorMessage, { variant: "error", autoHideDuration: 2000 });
      console.error("Erreur dans handleConfirm:", error);
    } finally {
      handleConfirmClose();
    }
  };
  
  const onSubmit = handleSubmit((data) => {
    console.log("test")

    const startDateTime = new Date(data.start);
    if (!startDateTime) {
      console.error("Start date est invalide !");
      return;
    }
  
    const selectedPlage = plagesHoraires.find(plage => plage.id === data.plageHoraire);
    if (selectedPlage) {
      const startHour = new Date(startDateTime);
      startHour.setHours(selectedPlage.heureDebut.getHours(), selectedPlage.heureDebut.getMinutes());
      data.start = startHour.toISOString();
    }
  
    const eventData = {
      id: currentEvent?.id || uuidv4(),
      description: data?.description,
      className: "indispo-background",
      start: data?.start,
      plageHoraire: data.plageHoraire || selectedPlageHoraire,
      module: data.module || selectedModuleId,
      classeSemestre: selectedClassId,
      salle: data.salle ? data.salle.id : []

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
            <MobileDatePicker
              {...field}
              value={new Date(field.value)}
              onChange={(newValue) => {
                if (newValue) {
                  field.onChange(fTimestamp(newValue));
                  handleDateChange(newValue);  
                }
              }}
              label="Date Cour"
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          )}
        />
        <Controller
          name="plageHoraire"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
  <InputLabel>Plage Horaire</InputLabel>
  <Select
    value={newPlageHoraire} 
    onChange={(event) => {
      handlePlageHoraireChange(event);
      field.onChange(event.target.value);
      setNewPlageHoraire(event.target.value)
    }}

    label="Plage Horaire"
  >
    <MenuItem value="">
      <em>Choisissez une plage horaire</em>
    </MenuItem>
    {plagesHoraires.map((plage) => (
      <MenuItem key={plage.id} value={plage.id}>
        {plage.codePlageHoraire}
      </MenuItem>
    ))}
  </Select>
</FormControl>
          )}
        />
 
        {/* Affichage du sélecteur de salle uniquement en mode modification */}
       
 
        {!currentEvent?.id && (
          <Controller
            name="module"
            control={control}
            render={({ field }) => (
             <FormControl variant="outlined" fullWidth>
  <InputLabel id="module-label">Module</InputLabel>
  <Select
    {...field}
    labelId="module-label"
    label="Module"
    value={field.value || ''}
    onChange={(event) => handleModuleChange(event, field)}
    MenuProps={{
      PaperProps: {
        style: {
          maxHeight: 200, // Hauteur maximale pour le scroll vertical
          width: 300,   // Largeur automatique pour permettre le scroll horizontal
          overflowX: 'auto', // Ajoute le scroll horizontal
        },
      },
    }}
  >
    <MenuItem value="">
      <em>Choisissez un module</em>
    </MenuItem>
    {modules.map((module) => (
      <MenuItem value={module.id} key={module.id}>
        <Tooltip title={`${module.nbHeureAdd} / ${module.chargeH} heures`}>
          <span>{module.designation}</span>
        </Tooltip>
      </MenuItem>
    ))}
  </Select>
</FormControl>
            )}
          />
        )}
    {selectedPlageHoraire && (
  <Controller
    name="salle"
    control={control}
    defaultValue={currentEvent?.salle?.id || null} // Ajoutez ceci

    render={({ field }) => (
      <FormControl fullWidth variant="outlined">
        <InputLabel id="salle-label">Salle</InputLabel>
        <Select
          value={newSalle || ''}
          onChange={(event) => {
            const value = event.target.value || null;
            handleSalleChange(event);
            field.onChange(value);
            setNewSalle(value);
          }}
          label="Salle"
        >
          <MenuItem value="">
            <em>Choisissez une salle</em>
          </MenuItem>
          {sallesDisponibles.map((salle) => (
            <MenuItem key={salle.id} value={salle.id}>
              {salle.nom}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )}
  />
)}
<RHFTextField name="description" label="Description" multiline rows={3} />
      </Stack>
 
      <Dialog open={openConfirmDialog} onClose={handleConfirmClose}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          {currentEvent?.id
            ? "Êtes-vous sûr de vouloir modifier ce cours ?"
            : "Êtes-vous sûr de vouloir ajouter ce cours ?"}
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
  disabled={!currentEvent?.id && !watch("module")} 
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
  onAddEvent: PropTypes.func.isRequired,
  employeeId: PropTypes.number.isRequired,
  selectedModuleId: PropTypes.string.isRequired,
  selectedClassId: PropTypes.string.isRequired,
 
};