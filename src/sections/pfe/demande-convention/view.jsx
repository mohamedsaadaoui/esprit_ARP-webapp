import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import BusinessIcon from '@mui/icons-material/Business';
import CircularProgress from '@mui/material/CircularProgress';
import { Download } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import PermissionBasedGuard from "src/auth/guard/permession-based-guard";
import ConventionService from 'src/services/pfe-services/conventionService';

import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';

import ConventionFileManager from '../file-manager/view/ConventionFileManager';
import AvenantFileManager from '../file-manager/view/AvenantFileManager';



// Form for creating new conventions
const ConventionForm = ({ 
  entreprises,
  selectedEntreprise,
  datedebut,
  datefin,
  adresseEntreprise,
  telephoneEntreprise,
  representantEntreprise,
  loading,
  handleEntrepriseChange,
  setDateDebut,
  setDateFin,
  setAdresseEntreprise,
  setTelephoneEntreprise,
  setRepresentantEntreprise,
  handleSubmit,
  isEditMode,
  // Nouvelles props pour l'avenant
  avenantFile,
  setAvenantFile,
//  uploadingAvenant,
  avenantRequired = false,
  existingConvention // <-- Add this prop
}) => {
  const theme = useTheme();

    // Callback pour gérer les changements de fichier d'avenant
  const handleAvenantFileChange = (file) => {
    setAvenantFile(file);
  };


  // Fonction pour gérer la soumission du formulaire
    const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier (PDF uniquement)
      if (file.type !== 'application/pdf') {
        alert('Veuillez sélectionner un fichier PDF uniquement.');
        return;
      }
      
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier doit faire moins de 10MB.');
        return;
      }
      
      setAvenantFile(file);
    }
  };

  const removeFile = () => {
    setAvenantFile(null);
    // Reset input file
    const fileInput = document.getElementById('avenant-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Entreprise</InputLabel>
            <Select value={selectedEntreprise} onChange={handleEntrepriseChange} label="Entreprise">
              {entreprises.map((entreprise) => (
                <MenuItem key={entreprise.id} value={entreprise}>
                  {entreprise.nomEntreprise}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Représentant de l'entreprise"
            value={representantEntreprise}
            onChange={(e) => setRepresentantEntreprise(e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Adresse de l'entreprise"
              value={adresseEntreprise}
              onChange={(e) => setAdresseEntreprise(e.target.value)}
              required
              InputProps={{
                readOnly: !!adresseEntreprise,
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Téléphone de l'entreprise"
              value={telephoneEntreprise}
              onChange={(e) => setTelephoneEntreprise(e.target.value)}
              required
              InputProps={{
                readOnly: !!telephoneEntreprise, // Rendre en lecture seule si déjà rempli
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date de début"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={datedebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date de fin"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={datefin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </Grid>

        {/* Section avenant pour modification */}
        {isEditMode && avenantRequired && (
          <Grid item xs={12}>
            <AvenantFileManager 
              convention={existingConvention}
              avenantFile={avenantFile}
              setAvenantFile={setAvenantFile}
              onFileChange={handleAvenantFileChange}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              px: 4,
              py: 1,
              borderRadius: '8px',
              boxShadow: theme.shadows[3],
              '&:hover': {
                boxShadow: theme.shadows[8],
              },
            }}
          >
            {loading ? (<CircularProgress size={24} /> ) : 'Soumettre'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default function ConventionView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const [entreprises, setEntreprises] = useState([]);
  const [selectedEntreprise, setSelectedEntreprise] = useState('');
  const [datedebut, setDateDebut] = useState('');
  const [datefin, setDateFin] = useState('');
  const [adresseEntreprise, setAdresseEntreprise] = useState('');
  const [telephoneEntreprise, setTelephoneEntreprise] = useState('');
  const [representantEntreprise, setRepresentantEntreprise] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [newConvention, setNewConvention] = useState(null);
  const [existingConvention, setExistingConvention] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [annulationEnCours, setAnnulationEnCours] = useState(false);

    // États pour l'avenant
  const [avenantFile, setAvenantFile] = useState(null);
  const [downloadingAvenant, setDownloadingAvenant] = useState(false);
  const [downloadingConvention, setDownloadingConvention] = useState(false);
  
  const confirmAnnulation = useBoolean();
  const { user } = useAuthContext() ;

  
  useEffect(() => {
    console.log('User:', user);
    const fetchData = async () => {
      try {
        // Récupérer les entreprises
        const entreprisesResponse = await ConventionService.getEntreprises();
        setEntreprises(entreprisesResponse.data || []);
        
        // Récupérer les conventions existantes
        const conventionsResponse = await ConventionService.getConventionsByEtudiant(user.sub);
        if (conventionsResponse.data && conventionsResponse.data.length > 0) {
          const conv = conventionsResponse.data[0];
          console.log('Convention existante:', conv.entreprise);
          setExistingConvention(conv);
          // Pré-remplir les champs pour édition
          setSelectedEntreprise(conv?.entreprise);
          setDateDebut(conv.datedebut);
          setDateFin(conv.datefin);
          setRepresentantEntreprise(conv.employeEntreprise?.email || '');
          setAdresseEntreprise(conv?.entreprise.adresseSiege);
          setTelephoneEntreprise(conv?.entreprise.telephone);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setNotification({
          open: true,
          message: 'Erreur lors du chargement des données',
          severity: 'error'
        });
      }
    };
    
    fetchData();
  }, [user]);


  // Fonction pour télécharger l'avenant
  const downloadAvenant = async () => {
    if (!existingConvention?.id) return;

    console.log(existingConvention)
    
    try {
      setDownloadingAvenant(true);
      // Appel API pour générer et télécharger l'avenant
      const response = await ConventionService.downloadFile(existingConvention?.avenants[0]?.pathAvenant);
      
      // Créer un lien de téléchargement
      const url = response.data.url || URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `avenant_convention_${existingConvention.id}.pdf`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      setTimeout(() => {
        document.body.removeChild(link);
        if (!response.data.url) {
          URL.revokeObjectURL(url);
        }
      }, 100);
      
      setNotification({
        open: true,
        message: 'Avenant téléchargé avec succès',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'avenant:', error);
      setNotification({
        open: true,
        message: 'Erreur lors du téléchargement de l\'avenant',
        severity: 'error'
      });
    } finally {
      setDownloadingAvenant(false);
    }
  };
  
  const resetNewConvention = () => {
    setNewConvention(null);
  };


  // Ajoutez cette fonction
const handleAnnulerConvention = async () => {
  try {
    setAnnulationEnCours(true);
    await ConventionService.annulerConvention(existingConvention.id);
    
    // Mettre à jour localement
    setExistingConvention({
      ...existingConvention,
      etat: 'ANNULEE',
      dateAnnulation: new Date().toISOString()
    });
    
    setNotification({
      open: true,
      message: 'Convention annulée avec succès',
      severity: 'success'
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    setNotification({
      open: true,
      message: 'Erreur lors de l\'annulation de la convention',
      severity: 'error'
    });
  } finally {
    setAnnulationEnCours(false);
    confirmAnnulation.onFalse();
  }
};
  
const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedEntreprise || !datedebut || !datefin || !adresseEntreprise || 
        !telephoneEntreprise || !representantEntreprise) {
      setNotification({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }

        // Dans handleSubmit, avant l'envoi des données
    if (new Date(datefin) <= new Date(datedebut)) {
      setNotification({
        open: true,
        message: 'La date de fin doit être postérieure à la date de début',
        severity: 'error'
      });
      return;
    }

     // Vérifier l'avenant pour les modifications
    if (existingConvention && !avenantFile) {
      setNotification({
        open: true,
        message: 'Veuillez uploader l\'avenant signé pour soumettre la modification',
        severity: 'error'
      });
      return;
    }
    

    
    try {
    setLoading(true);


          // Format the request data to match ConventionRequestDto
      const conventionData = {
        etudiantId: user.sub,
        emailEtudiant: user.email, // Add if needed
        dateDebut: datedebut,
        dateFin: datefin,
        entrepriseId: selectedEntreprise.id, // Send ID instead of full object
        adresseEntreprise,
        telephoneEntreprise,
        representantEntreprise
      };

    let result;
      
    if (existingConvention) {
        // Upload de l'avenant d'abord si nécessaire
        // Pour une modification, préparer FormData avec l'avenant
        const formData = new FormData();
        
        // Ajouter les données de la convention
        Object.keys(conventionData).forEach(key => {
          formData.append(key, conventionData[key]);
        });
        
        // Ajouter le fichier avenant si présent
        if (avenantFile) {
          formData.append('avenant', avenantFile);
        }
        
      // Mise à jour de la convention existante
      result = await ConventionService.updateConventionWithAvenant(
        existingConvention.id, 
        formData
      );
    } else {
      // Création d'une nouvelle convention
      result = await ConventionService.demandeConvention(conventionData);
    }
      
      setLoading(false);
      
   // Mettre à jour l'affichage avec les nouvelles données
    const updatedConvention = {
      ...(existingConvention || {}),
      ...result.data,
      datedebut,
      datefin,
      etat: 'EN_ATTENTE', // Réinitialiser le statut après modification
      dateSaisieDemande: new Date().toISOString(),
      entreprise: entreprises.find(e => e.id === selectedEntreprise.id),
      employeEntreprise: {
        ...(existingConvention?.employeEntreprise || {}),
        email: representantEntreprise
      }
    };
    
    setExistingConvention(updatedConvention);
      
      setIsEditing(false);
      setAvenantFile(null); // Reset avenant file

      setNotification({
        open: true,
        message: existingConvention 
          ? 'Demande de modification envoyée' 
          : 'Demande de convention soumise avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
      setNotification({
        open: true,
        message: 'Échec de la soumission',
        severity: 'error'
      });
    }
  };
  
    const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

// Fonction pour télécharger la convention
const downloadConvention = async (pathConvention) => {
  try {
    setDownloadingConvention(true);

    // 1. Obtenir l'URL signée depuis le backend
    const response = await ConventionService.downloadFile(pathConvention);
    console.log('Réponse de téléchargement:', response);
    
    // 2. Extraire l'URL de la réponse
    const signedUrl = response.data.url;
    
    // 3. Créer un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = signedUrl;
    link.setAttribute('download', `convention_stage_${pathConvention}.pdf`);
    link.setAttribute('target', '_blank'); // Ouvrir dans un nouvel onglet
    document.body.appendChild(link);
    
    // 4. Déclencher le téléchargement
    link.click();
    
    // 5. Nettoyage
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(signedUrl);
    }, 100);
    
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    
    // Gestion des erreurs
    let errorMessage = 'Erreur lors du téléchargement';
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Document non trouvé';
      } else if (error.response.status === 403) {
        errorMessage = 'Accès refusé';
      }
    }
    
    // Afficher une notification d'erreur
    setNotification({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  }
  finally {
    setDownloadingConvention(false);
  }
};

  const handleCancelEdit = () => {
  // Réinitialiser les valeurs avec les données originales
  if (existingConvention) {
    setSelectedEntreprise(existingConvention.entreprise || null);
    setDateDebut(existingConvention.datedebut);
    setDateFin(existingConvention.datefin);
    setAdresseEntreprise(existingConvention.entreprise?.adresseSiege || '');
    setTelephoneEntreprise(existingConvention.entreprise?.telephone || '');
    setRepresentantEntreprise(existingConvention.employeEntreprise?.email || '');
  }
  setIsEditing(false);
  setAvenantFile(null); // Reset avenant file
};

  const handleEntrepriseChange = (event) => {
  const entreprise = event.target.value;
  console.log('entreprise', entreprise)
  setSelectedEntreprise(entreprise);
  
  // Trouver l'entreprise sélectionnée dans la liste
  const selected = entreprises.find(e => e.id === entreprise.id);
  
  if (selected) {
    setAdresseEntreprise(selected.adresseSiege || '');
    setTelephoneEntreprise(selected.telephone || '');
  }
};

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <PermissionBasedGuard permissions={['ACCESS_PFE']} hasContent>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        {existingConvention && !isEditing ? (
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
              borderTopRightRadius: '8px'
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                color: theme.palette.primary.main
              }}
            >
              <BusinessIcon sx={{ mr: 1 }} /> 
                {existingConvention.etat === 'APPROUVEE' 
                  ? 'Ma convention de stage' 
                  : 'Ma demande de convention'}            
              </Typography>

              <Grid container spacing={2}>
                {/* Entreprise */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Entreprise"
                    value={existingConvention?.entreprise?.nomEntreprise}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                {/* Représentant */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Représentant de l'entreprise"
                    value={existingConvention.employeEntreprise?.email || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                {/* Adresse */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Adresse de l'entreprise"
                    value={existingConvention?.entreprise?.adresseSiege || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                {/* Téléphone */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Téléphone de l'entreprise"
                    value={existingConvention?.entreprise?.telephone || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                {/* Date de début */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date de début"
                    value={formatDate(existingConvention.datedebut) || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                {/* Date de fin */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date de fin"
                    value={formatDate(existingConvention.datefin) || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                {/* Statut */}
                <Grid item xs={12} md={6}>
                  {(() => {
                    let etat = '';
                    if (existingConvention.etat === 'APPROUVEE') {
                      etat = 'Approuvée';
                    } else if (existingConvention.etat === 'EN_ATTENTE') {
                      etat = 'En attente';
                    } else if (existingConvention.etat === 'REJETEE') {
                      etat = 'Rejetée';
                    }
                    return (
                      <TextField
                        fullWidth
                        label="etat"
                        value={etat}
                        InputProps={{ readOnly: true }}
                      />
                    );
                  })()}
                </Grid>
                
                {/* Date de création */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date de demande"
                    value={formatDate(existingConvention.dateSaisieDemande) || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                {/* Commentaire (si rejetée) */}
                {existingConvention.etat === 'REJETEE' && existingConvention.commentaire && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Motif du rejet"
                      value={existingConvention.commentaire}
                      InputProps={{ readOnly: true }}
                      multiline
                      rows={3}
                    />
                  </Grid>
                )}

                
                {/* Ajouter tous les autres champs en lecture seule */}
                
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsEditing(true)}
                    sx={{ mr: 2 }}
                    startIcon={<EditIcon/>}
                  >
                    Modifier
                  </Button>

                {/* Bouton pour télécharger l'avenant */}
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={downloadAvenant}
                      disabled={downloadingAvenant}
                      startIcon={downloadingAvenant ? <CircularProgress size={16} /> : 
                      <Download />}
                    >
                      {downloadingAvenant ? 'Téléchargement...' : 'Avenant'}
                    </Button>
                  
                  {existingConvention.etat === 'APPROUVEE' && (
                    <Button 
                    variant="outlined" 
                    color="success"
                    onClick={() => downloadConvention(existingConvention?.pathConvention)}
                    disabled={downloadingConvention}
                    startIcon={downloadingConvention ? <CircularProgress size={16} /> : 
                      <Download />}
                    >
                      {downloadingConvention ? 'Téléchargement...' : 'Convention'}
                    </Button>
                  )}
                  {/* Nouveau bouton d'annulation */}
                  {existingConvention && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={confirmAnnulation.onTrue}
                      disabled={annulationEnCours}
                    >
                      {annulationEnCours ? <CircularProgress size={24} /> : 'Annuler la convention'}
                    </Button>
                  )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ mb: 5, /* styles... */ }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1 }} /> 
                {existingConvention ? 'Modifier ma convention' : 'Nouvelle demande de convention'}
              </Typography>
            <ConventionForm 
              entreprises={entreprises}
              selectedEntreprise={selectedEntreprise}
              datedebut={datedebut}
              datefin={datefin}
              adresseEntreprise={adresseEntreprise}
              telephoneEntreprise={telephoneEntreprise}
              representantEntreprise={representantEntreprise}
              loading={loading}
              handleEntrepriseChange={handleEntrepriseChange}
              setDateDebut={setDateDebut}
              setDateFin={setDateFin}
              setAdresseEntreprise={setAdresseEntreprise}
              setTelephoneEntreprise={setTelephoneEntreprise}
              setRepresentantEntreprise={setRepresentantEntreprise}
              handleSubmit={handleSubmit}
              isEditMode={!!existingConvention}
              // Props pour l'avenant
              avenantFile={avenantFile}
              setAvenantFile={setAvenantFile}
              // uploadingAvenant={uploadingAvenant}
              avenantRequired={!!existingConvention}
              existingConvention={existingConvention} // <-- Pass the prop here
            />
            
              {existingConvention && (
                <Button
                  variant="outlined"
                  color="info"
                  onClick={() => setIsEditing(false)}
                  sx={{ mt: 2 }}
                >
                  Annuler
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            variant="filled"
            elevation={6}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        {/* ... (autres ConfirmDialog) */}
      {(existingConvention && existingConvention.etat === 'APPROUVEE') && (
           <ConventionFileManager convention={existingConvention} />
        )}

        <ConfirmDialog
          open={confirmAnnulation.value}
          onClose={confirmAnnulation.onFalse}
          title="Annuler la convention"
          content="Êtes-vous sûr de vouloir annuler cette convention de stage ? Cette action est irréversible."
          action={
            <Button
              variant="contained"
              color="error"
              onClick={handleAnnulerConvention}
              disabled={annulationEnCours}
            >
              {annulationEnCours ? <CircularProgress size={24} /> : 'Confirmer l\'annulation'}
            </Button>
          }
        />
      </Container>
    </PermissionBasedGuard>
  );
}

ConventionForm.propTypes = {
  entreprises: PropTypes.array.isRequired,
  selectedEntreprise: PropTypes.string.isRequired,
  datedebut: PropTypes.string.isRequired,
  datefin: PropTypes.string.isRequired,
  adresseEntreprise: PropTypes.string.isRequired,
  telephoneEntreprise: PropTypes.string.isRequired,
  representantEntreprise: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  handleEntrepriseChange: PropTypes.func.isRequired,
  setDateDebut: PropTypes.func.isRequired,
  setDateFin: PropTypes.func.isRequired,
  setAdresseEntreprise: PropTypes.func.isRequired,
  setTelephoneEntreprise: PropTypes.func.isRequired,
  setRepresentantEntreprise: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  avenantFile: PropTypes.any,
  setAvenantFile: PropTypes.func,
  // uploadingAvenant: PropTypes.bool,
  avenantRequired: PropTypes.bool,
  existingConvention: PropTypes.object // <-- Add prop validation
};