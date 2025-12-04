import * as React from 'react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Card, Container, Grid, Chip, Autocomplete, Stack, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// Ou si vous n'avez pas Iconify, utilisez directement depuis MUI :
import { useAuthContext } from 'src/auth/hooks';
import PermissionBasedGuard from 'src/auth/guard/permession-based-guard';
import profileService from 'src/services/online-services/profileService';
import conventionService from 'src/services/pfe-services/conventionService';
import planTravailService from 'src/services/pfe-services/planTravailService';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import TaskItem from '../TaskItem';
// Liste des technologies disponibles
const TECHNOLOGIES = [
  'React',
  'Node.js',
  'MongoDB',
  'Express',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring Boot',
  'Angular',
  'Vue.js',
  'MySQL',
  'PostgreSQL',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Firebase',
];

// Technologies suggérées (les plus populaires)
const SUGGESTED_TECHNOLOGIES = [
  'React',
  'Node.js',
  'Python',
  'Django',
  'Java',
  'MySQL',
  'Docker',
  'AWS',
];

export default function PlanTravailView() {
  const settings = useSettingsContext();
  const theme = useTheme();
  const auth = useAuthContext();
  const [loading, setLoading] = React.useState(true);
  const [studentData, setStudentData] = useState(null);
  const [entreprises, setEntreprises] = useState([]);
  const [existingPlan, setExistingPlan] = useState(null);



  useEffect(() => {
  const fetchPlanTravail = async () => {
  try {
    if (auth?.user?.sub) {
      const response = await planTravailService.getPlanTravailByEtudiant(auth.user.sub);
      if (response.data) {
        setExistingPlan(response.data);
        // Pré-remplir le formulaire avec les données existantes
        setFormData({
          nomPrenom: `${studentData?.nom} ${studentData?.prenom}` || '',
          emailEsprit: studentData?.email || '',
          adresse: studentData?.adresse || '',
          telephone: studentData?.telephone || '',
          titreProjet: response.data.titre || '',
          descriptionProjet: response.data.description || '',
          problematiqueProjet: response.data.problematique || '',
          technologies: response.data.details
            .filter(d => d.typeDetail === 'Technologie')
            .flatMap(d => d.description.split(', ')),
          tasks: response.data.details
            .filter(d => d.typeDetail === 'Tâche')
            .map(d => {
              const match = d.description.match(/(.*) \(Durée: (\d+) jours\)/);
              return {
                description: match ? match[1] : d.description,
                duration: match ? parseInt(match[2], 10) : 1
              };
            }),
          entrepriseId: response.data.entreprise?.id || '',
          encadrants: response.data.encadrants || ''
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du plan de travail:', error);
  }
};
    // Fonction pour récupérer la liste des entreprises
    const fetchEntreprises = async () => {
      try {
        const entreprisesResponse = await conventionService.getEntreprises();
        setEntreprises(entreprisesResponse.data || []);

      } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
      }
    };

    const fetchStudentData = async () => {
      try {
        if (auth?.user?.sub) {
          const response = await profileService.getEtudiantData(auth.user.sub);
          const data = response.response.data;
          console.log('Données étudiant récupérées:', data);
          setStudentData(data);

          // Pré-remplir le formulaire avec les données de l'étudiant
          setFormData((prev) => ({
            ...prev,
            nomPrenom: `${data.nom} ${data.prenom}`,
            emailEsprit: data.email,
            adresse: data.adresse || '',
            telephone: data.telephone || '',
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données étudiant:', error);
      } finally {
        setLoading(false);
      }
    };


  const fetchData = async () => {
    await fetchEntreprises();
    await fetchStudentData();
    await fetchPlanTravail();
    setLoading(false);
  };

  fetchData();
  }, [auth.user.sub, studentData?.adresse, studentData?.email, studentData?.nom, studentData?.prenom, studentData?.telephone]);

  const steps = [
    'Informations Personnelles',
    'Plan Travail',
    'Entreprise & Encadrement',
    'Confirmation',
  ];

  const [activeStep, setActiveStep] = React.useState(0);
  const methods = useForm({
    defaultValues: {
      nomPrenom: '',
      emailEsprit: '',
      adresse: '',
      telephone: '',
      titreProjet: '',
      descriptionProjet: '',
      problematiqueProjet: '',
      technologies: [],
      entrepriseId: '',
      tasks: [], // Nouveau champ pour les tâches
      encadrants: '',
    },
  });
  const [formData, setFormData] = React.useState({
    // Informations Personnelles
    nomPrenom: '',
    emailEsprit: '',
    adresse: '',
    telephone: '',

    // Plan Travail
    titreProjet: '',
    descriptionProjet: '',
    problematiqueProjet: '',
    technologies: [],
    tasks: [], // Nouveau champ pour les tâches

    // Entreprise & Encadrement
    entrepriseId: '', // ID de l'entreprise sélectionnée
    encadrants: '',
  });

  const pageTitle = studentData
    ? `Dépôt Plan Travail - ${studentData.prenom} ${studentData.nom}`
    : 'Dépôt Plan Travail';

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      titreProjet: '',
      descriptionProjet: '',
      problematiqueProjet: '',
      technologies: [],
      entrepriseId: '',
      tasks: [],
      encadrants: '',
    });
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleTechnologiesChange = (event, newValue) => {
    setFormData({
      ...formData,
      technologies: newValue,
    });
  };

  const handleSuggestedTechClick = (tech) => {
    if (!formData.technologies.includes(tech)) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, tech],
      });
    }
  };

  const handleAddTask = () => {
    setFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { description: '', duration: 1 }],
    }));
  };

  const handleTaskChange = (index, field, value) => {
    setFormData((prev) => {
      const newTasks = [...prev.tasks];
      newTasks[index] = { ...newTasks[index], [field]: value };
      return { ...prev, tasks: newTasks };
    });
  };

  const handleRemoveTask = (index) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      // Valider les données avant soumission
      if (!formData.titreProjet || !formData.problematiqueProjet || formData.tasks.length === 0) {
        alert('Veuillez remplir tous les champs obligatoires et ajouter au moins une tâche');
        return;
      }

      // Préparer les données pour l'envoi
      const submissionData = {
        ...formData,
        etudiantId: auth.user.sub, // Ajoutez l'ID de l'étudiant
      };

      const response = await planTravailService.submitPlanTravail(submissionData);
      console.log('Soumission réussie:', response);

      handleNext();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Une erreur est survenue lors de la soumission');
    }
  };


  const handleEntrepriseChange = (event) => {
  const selectedEntreprise = event.target.value;
  console.log('entreprise', selectedEntreprise)
  setFormData((prev) => ({
    ...prev,
  //  nomEntreprise: selectedEntreprise.nomEntreprise, // Assurez-vous que l'objet entreprise a cette propriété
        // If you need to store the ID as well:
    entrepriseId: selectedEntreprise.id
  }));
};


  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations Personnelles
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Vous pouvez modifier les données marquées avec (*) en cliquant sur la donnée désirée.
            </Typography>

            <TextField
              label="Nom & Prénom"
              value={formData.nomPrenom}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              margin="normal"
              variant="outlined"
            />

            <TextField
              label="E-Mail (Esprit)"
              value={formData.emailEsprit}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              margin="normal"
              variant="outlined"
            />

            <TextField
              label="Adresse (*)"
              value={formData.adresse}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              margin="normal"
              variant="outlined"
            />

            <TextField
              label="Numéro de Téléphone (*)"
              value={formData.telephone}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              margin="normal"
              variant="outlined"
            />
          </Paper>
        );
      case 1:
        return (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Détails Plan Travail
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Présenter l idée de votre projet.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  label="Titre Projet (*)"
                  value={formData.titreProjet}
                  onChange={handleInputChange('titreProjet')}
                  fullWidth
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description Projet"
                  value={formData.descriptionProjet}
                  onChange={handleInputChange('descriptionProjet')}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Problématique Projet (*)"
                  value={formData.problematiqueProjet}
                  onChange={handleInputChange('problematiqueProjet')}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Tâches/Fonctionnalités
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                {formData.tasks.map((task, index) => (
                  <TaskItem
                    key={index}
                    task={task}
                    index={index}
                    onTaskChange={handleTaskChange}
                    onRemoveTask={handleRemoveTask}
                  />
                ))}


        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAddTask}
          sx={{ flexShrink: 0 }}
        >
          Ajouter une Tâche
        </Button>
              </Grid>
            </Grid>
                <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={TECHNOLOGIES}
                  getOptionLabel={(option) => option}
                  value={formData.technologies}
                  onChange={handleTechnologiesChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={option} {...getTagProps({ index })} key={option} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Technologies utilisées"
                      placeholder="Sélectionnez des technologies"
                    />
                  )}
                />

                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Suggestions:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  {SUGGESTED_TECHNOLOGIES.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      onClick={() => handleSuggestedTechClick(tech)}
                      variant={formData.technologies.includes(tech) ? 'filled' : 'outlined'}
                      color={formData.technologies.includes(tech) ? 'primary' : 'default'}
                      size="small"
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        );
      case 2:
        return (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Entreprise & Encadrement
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Présenter votre Entreprise d Accueil et vos Encadrant(s).
            </Typography>

            <Grid item xs={12} md={6}>

              <FormControl fullWidth required>
                <InputLabel>Entreprise</InputLabel>
                <Select 
                value={entreprises.find(e => e.id === formData.entrepriseId) || ''}
                onChange={handleEntrepriseChange} 
                label="Entreprise">
                
                  {entreprises.map((entreprise) => (
                    <MenuItem key={entreprise.id} value={entreprise}>
                      {entreprise.nomEntreprise}
                    </MenuItem>
                  ))}

                </Select>
              </FormControl>
            </Grid>


            <TextField
              label="Encadrants"
              value={formData.encadrants}
              onChange={handleInputChange('encadrants')}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
            />
          </Paper>
        );
      case 3:
        return (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Confirmation
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sauvegarder et/ou Confirmer votre Plan de Travail.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Informations Personnelles:
              </Typography>
              <Typography>Nom & Prénom: {formData.nomPrenom || 'Non renseigné'}</Typography>
              <Typography>Email Esprit: {formData.emailEsprit || 'Non renseigné'}</Typography>
              <Typography>Adresse: {formData.adresse || 'Non renseigné'}</Typography>
              <Typography>Téléphone: {formData.telephone || 'Non renseigné'}</Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                Plan Travail:
              </Typography>
              <Typography>
                <strong>Titre:</strong> {formData.titreProjet || 'Non renseigné'}
              </Typography>
              <Typography>
                <strong>Description:</strong> {formData.descriptionProjet || 'Non renseigné'}
              </Typography>
              <Typography>
                <strong>Problématique:</strong> {formData.problematiqueProjet || 'Non renseigné'}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                Tâches/Fonctionnalités:
              </Typography>
              {formData.tasks.length > 0 ? (
                <ul>
                  {formData.tasks.map((task, index) => (
                    <li key={index}>
                      <Typography>
                        <strong>{task.description}</strong> - Durée: {task.duration} jour(s)
                      </Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>Aucune tâche définie</Typography>
              )}
              <Typography>
                <strong>Technologies:</strong>
                {formData.technologies.length > 0
                  ? formData.technologies.join(', ')
                  : 'Non renseigné'}
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                Entreprise & Encadrement:
              </Typography>
              <Typography>Entreprise: {formData.nomEntreprise || 'Non renseigné'}</Typography>
              <Typography>Encadrants: {formData.encadrants || 'Non renseigné'}</Typography>
            </Box>
          </Paper>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <PermissionBasedGuard permissions={['ACCESS_PFE']} hasContent>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <FormProvider {...methods}>
          <Card
            sx={{
              mb: 5,
              overflow: 'visible',
              boxShadow: theme.shadows[10],
              borderRadius: 2,
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                backgroundColor: theme.palette.primary.main,
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              },
            }}
          >
            <Box sx={{ width: '100%', p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {pageTitle}
              </Typography>

              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {activeStep === steps.length ? (
                <>
                  <Typography sx={{ mt: 2, mb: 1 }}>
                    Toutes les étapes sont complétées - vous avez terminé
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button onClick={handleReset}>Réinitialiser</Button>
                  </Box>
                </>
              ) : (
                <>
                  {renderStepContent(activeStep)}

                  <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                      color="inherit"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Retour
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button
                      onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                      variant="contained"
                    >
                      {activeStep === steps.length - 1 ? 'Confirmer' : 'Suivant'}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Card>
        </FormProvider>
      </Container>
    </PermissionBasedGuard>
  );
}
