/* eslint-disable no-nested-ternary */
import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Dialog,
  Button,
  Container,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Alert
} from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { RHFUpload } from 'src/components/hook-form/rhf-upload';
import PropTypes from 'prop-types';
import conventionService from 'src/services/pfe-services/conventionService';
import FileRecentItem from '../file-recent-item';

export default function ConventionFileManager({ convention }) {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [fileToRemove, setFileToRemove] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conventionFile, setConventionFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const methods = useForm({
    defaultValues: {},
  });

  const {
    watch,
    setValue,
    control,
    formState: { isSubmitting },
  } = methods;
  const values = watch();


  // Récupérer les détails du fichier de convention
  useEffect(() => {
    if (!convention?.pathSignedConvention) {
      setConventionFile(null);
      return;
    }

    const fetchFileDetails = async () => {
      try {
        setIsLoading(true);
        
        const fileObject = {
          name: convention.pathSignedConvention.split('/').pop() || 'convention signée.pdf',
          path: convention.pathSignedConvention,
          size: 0,
          type: 'application/pdf'
        };

        try {
          const response = await conventionService.downloadFile(convention.pathSignedConvention);
          fileObject.preview = response.data.url;
          fileObject.url = response.data.url;
        } catch (error) {
          console.error('Failed to fetch URL:', error);
          enqueueSnackbar('Impossible de récupérer le fichier', { variant: 'warning' });
        }

        setConventionFile(fileObject);
        
        setValue('conventionFile', fileObject);
      } catch (error) {
        enqueueSnackbar('Erreur lors du chargement de la convention', { variant: 'error' });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileDetails();
  }, [convention?.pathSignedConvention, enqueueSnackbar, setValue]);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      if (!convention?.id || acceptedFiles.length === 0) return;

      try {
        setIsLoading(true);
        setUploadProgress(0);
        
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]); // Un seul fichier
        formData.append('conventionId', convention.id);

        const uploadResponse  = await conventionService.uploadSignedConvention(formData);

        const response = await conventionService.downloadFile(uploadResponse.data);

        console.log('uploadResponse', uploadResponse);
        console.log('response', response);
        console.log('file', acceptedFiles[0]);  
        const newFile = {
          name: 'convention signée.pdf',
          path: uploadResponse.data,
          preview: response.data.url,
          url: response.data.url,
          size: acceptedFiles[0].size,
          type: acceptedFiles[0].type
        };

        setConventionFile(newFile);
        setValue('conventionFile', newFile);
        
        enqueueSnackbar('Convention téléversée avec succès', { variant: 'success' });
      } catch (error) {
        console.error('Upload error:', error);
        enqueueSnackbar('Échec du téléversement', { 
          variant: 'error',
          details: error.response?.data?.message || error.message
        });
      } finally {
        setIsLoading(false);
        setUploadProgress(0);
      }
    },
    [convention.id, enqueueSnackbar, setValue]
  );

  const handleRemove = useCallback((file) => {
    setFileToRemove(file);
    setOpenDialog(true);
  }, []);

  const confirmRemove = async () => {
    if (!fileToRemove || !convention?.id) return;

    try {
      setIsLoading(true);
      await conventionService.deleteConventionDocument(convention.id, fileToRemove.path);
      
      setConventionFile(null);
      setValue('conventionFile', null);

      enqueueSnackbar('Convention supprimée avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar('Échec de la suppression', { variant: 'error' });
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
      setFileToRemove(null);
    }
  };

  const cancelRemove = () => {
    setOpenDialog(false);
    setFileToRemove(null);
  };

  return (
    <FormProvider {...methods}>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Convention Signée
            </Typography>
            
            {isLoading && uploadProgress > 0 ? (
              <Stack spacing={2} alignItems="center">
                <CircularProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2">{uploadProgress}%</Typography>
              </Stack>
            ) : isLoading ? (
              <CircularProgress />
            ) : (
              <Stack spacing={2}>
                {conventionFile ? (
                  <FileRecentItem
                    key={conventionFile.path}
                    file={{
                      ...conventionFile,
                      extension: 'pdf', // Forcer l'extension PDF pour l'icône

                    }}
                    onDelete={handleRemove}
                  />
                ) : (
                  <>
                    <Alert severity="info">
                      Aucune convention signée n a été déposée
                    </Alert>
                    <RHFUpload
                      name="conventionFile"
                      multiple={false}
                      maxSize={10485760} // 10MB
                      onDrop={handleDrop}
                      helperText="Format PDF (max 10MB)"
                    />
                  </>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Dialog open={openDialog} onClose={cancelRemove}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer cette convention signée ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelRemove} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={confirmRemove} 
              color="error"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Confirmer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </FormProvider>
  );
}

ConventionFileManager.propTypes = {
  convention: PropTypes.shape({
    id: PropTypes.string.isRequired,
    pathSignedConvention: PropTypes.string
  }).isRequired
};