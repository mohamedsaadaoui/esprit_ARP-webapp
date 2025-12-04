import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Stack,
    Alert,
    Box,
    Chip
} from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { RHFUpload } from 'src/components/hook-form/rhf-upload';
import PropTypes from 'prop-types';
import conventionService from 'src/services/pfe-services/conventionService';
import FileRecentItem from '../file-recent-item';

export default function AvenantFileManager({ 
  convention, 
  avenantFile, 
  setAvenantFile,
  onFileChange 
}) {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const [existingAvenants, setExistingAvenants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {},
  });

  const {
    watch,
    setValue,
    control,
  } = methods;

  // Récupérer les avenants existants (lecture seule)
  useEffect(() => {
    if (!convention?.avenants || convention.avenants.length === 0) {
      setExistingAvenants([]);
      return;
    }

    const fetchExistingAvenants = async () => {
      try {
        setIsLoading(true);
        const files = await Promise.all(
          convention.avenants.map(async (avenant) => {
            const fileObject = {
              id: avenant.id,
              name: avenant.pathSignedAvenant?.split('/').pop() || `avenant_${avenant.id}.pdf`,
              path: avenant.pathSignedAvenant,
              size: 0,
              type: 'application/pdf',
              typeAvenant: avenant.typeAvenant,
              etat: avenant.etat,
              isExisting: true // Marquer comme fichier existant
            };

            try {
              const response = await conventionService.downloadFile(avenant.pathSignedAvenant);
              fileObject.preview = response.data.url;
              fileObject.url = response.data.url;
            } catch (error) {
              console.error('Failed to fetch URL for avenant:', avenant.id, error);
            }

            return fileObject;
          })
        );

        setExistingAvenants(files.filter(file => file.path));
      } catch (error) {
        enqueueSnackbar('Erreur lors du chargement des avenants existants', { variant: 'error' });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingAvenants();
  }, [convention?.avenants, enqueueSnackbar]);

  // Gérer l'ajout d'un nouveau fichier d'avenant
  const handleDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      
      // Validation du fichier
      if (file.type !== 'application/pdf') {
        enqueueSnackbar('Veuillez sélectionner un fichier PDF uniquement.', { variant: 'error' });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        enqueueSnackbar('Le fichier doit faire moins de 10MB.', { variant: 'error' });
        return;
      }

      // Créer un objet fichier avec preview
      const fileObject = {
        ...file,
        id: Date.now(), // ID temporaire
        preview: URL.createObjectURL(file),
        isNew: true // Marquer comme nouveau fichier
      };

      setAvenantFile(fileObject);
      
      // Notifier le parent du changement
      if (onFileChange) {
        onFileChange(fileObject);
      }

      enqueueSnackbar('Avenant sélectionné. Il sera envoyé lors de la soumission.', { 
        variant: 'info' 
      });
    },
    [setAvenantFile, onFileChange, enqueueSnackbar]
  );

  // Supprimer le fichier sélectionné (nouveau fichier seulement)
  const handleRemoveNewFile = useCallback(() => {
    setAvenantFile(null);
    if (onFileChange) {
      onFileChange(null);
    }
  }, [setAvenantFile, onFileChange]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            
            {/* Avenants existants (lecture seule) */}
            {existingAvenants.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  Avenants existants
                </Typography>
                <Stack spacing={2}>
                  {existingAvenants.map((file) => (
                    <Box key={file.id} sx={{ position: 'relative' }}>
                      <FileRecentItem
                        file={{
                          ...file,
                          extension: 'pdf',
                          name: `${file.typeAvenant || 'Avenant'} (${file.etat || 'Non validé'})`
                        }}
                        onDelete={null} // Pas de suppression pour les fichiers existants
                      />
                      <Chip 
                        label="Existant" 
                        size="small" 
                        color="info"
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8 
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Nouveau fichier d'avenant */}
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
              Joindre un nouvel avenant signé
            </Typography>
            
            {avenantFile ? (
              <Box sx={{ position: 'relative' }}>
                <FileRecentItem
                  file={{
                    ...avenantFile,
                    extension: 'pdf',
                    name: avenantFile.name || 'Nouvel avenant'
                  }}
                  onDelete={handleRemoveNewFile}
                />
                <Chip 
                  label="Nouveau - À envoyer" 
                  size="small" 
                  color="warning"
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8 
                  }}
                />
              </Box>
            ) : (
              <Stack spacing={2}>
                <Alert severity="info">
                  Sélectionnez un fichier PDF signé pour l avenant. Il sera envoyé avec votre modification.
                </Alert>
                <RHFUpload
                  name="avenantFile"
                  multiple={false}
                  maxSize={10485760} // 10MB
                  onDrop={handleDrop}
                  helperText="Format PDF uniquement (max 10MB)"
                />
              </Stack>
            )}

            {avenantFile && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Avenant prêt à être envoyé : {avenantFile.name}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Container>
    </FormProvider>
  );
}

AvenantFileManager.propTypes = {
  convention: PropTypes.shape({
    id: PropTypes.string.isRequired,
    avenants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        pathSignedAvenant: PropTypes.string,
        typeAvenant: PropTypes.string,
        etat: PropTypes.string
      })
    )
  }).isRequired,
  avenantFile: PropTypes.object, // Le fichier sélectionné
  setAvenantFile: PropTypes.func.isRequired, // Fonction pour mettre à jour le fichier
  onFileChange: PropTypes.func // Callback optionnel lors du changement de fichier
};