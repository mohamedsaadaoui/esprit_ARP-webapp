import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { 
  Box, 
  Chip, 
  Card, 
  Grid, 
  Paper, 
  Stack, 
  Button,
  Divider,
  Container,
  Typography,
  CardContent
} from '@mui/material';
import { 
  Cancel as CancelIcon, 
  Article as ArticleIcon, 
  Download as DownloadIcon, 
  DateRange as DateRangeIcon, 
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  FilePresentOutlined as FileIcon
} from '@mui/icons-material';

const JustificationDetails = ({ justification }) => {
  const [previewVisible, setPreviewVisible] = useState(true);

  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
  };

  const getStatusColor = (status) => status ? 'success' : 'error';

  const getStatusIcon = (status) => status ? <CheckCircleIcon /> : <CancelIcon />;

  const renderDocument = () => {
    if (justification.documentData) {
      const base64Data = justification.documentData;
      const fileType = 'application/pdf';
      const fileName = 'justification_document.pdf';

      return (
        <Box sx={{ mt: 3, width: '100%' }}>
          <Card variant="outlined" sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <FileIcon color="primary" fontSize="large" />
                <Typography variant="h6">Document de justification</Typography>
              </Stack>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                href={`data:${fileType};base64,${base64Data}`}
                download={fileName}
                sx={{ mb: 2 }}
              >
                Télécharger le document
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={togglePreview}
                sx={{ ml: 2, mb: 2 }}
              >
                {previewVisible ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}
              </Button>
            </CardContent>
          </Card>
          
          {previewVisible && (
            <Box sx={{ 
              height: '500px', 
              border: '1px solid #e0e0e0', 
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: 2
            }}>
              <iframe
                src={`data:${fileType};base64,${base64Data}`}
                width="100%"
                height="100%"
                title="Document Preview"
                style={{ border: 'none' }}
              />
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ mt: 3, textAlign: 'center', p: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <ArticleIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          Aucun document disponible
        </Typography>
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '8px',
            backgroundColor: '#ce171f'
          }}
        />
        
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          sx={{ 
            mb: 4,
            color: '#ce171f',
            fontWeight: 'bold'
          }}
        >
          Détails de la Justification
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <DescriptionIcon sx={{ mr: 2, color: '#546e7a' }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {justification.description}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <DateRangeIcon sx={{ mr: 2, color: '#546e7a' }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {moment(justification.dateJustification).format('DD/MM/YYYY')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                {getStatusIcon(justification.etat)}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    État
                  </Typography>
                  <Chip 
                    label={justification.etat ? 'Approuvé' : 'En attente'} 
                    color={getStatusColor(justification.etat)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        {renderDocument()}
      </Paper>
    </Container>
  );
};

JustificationDetails.propTypes = {
  justification: PropTypes.shape({
    description: PropTypes.string.isRequired,
    dateJustification: PropTypes.string.isRequired,
    documentData: PropTypes.string,
    etat: PropTypes.bool
  }).isRequired,
};

export default JustificationDetails;