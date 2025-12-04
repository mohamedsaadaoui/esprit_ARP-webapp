import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';

import { Box, Button, Container, Typography, CircularProgress } from '@mui/material';
import PermissionBasedGuard from "src/auth/guard/permession-based-guard"

import { useAuthContext } from 'src/auth/hooks';
import edtService from 'src/services/online-services/edtService';

import { useSettingsContext } from 'src/components/settings';

export default function EdtView() {
  const settings = useSettingsContext();
  const { user, isLoading: authLoading } = useAuthContext();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPdf = useCallback(async (classe) => {
    if (!classe) return;
    try {
      setLoading(true);
      setError(null);

      const response = await edtService.getEmploisEtudiantByClasseAndDate('1A1', '2025-04-20');
      const fileBlob = new Blob([response.data], { type: 'application/pdf' });

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(URL.createObjectURL(fileBlob));
    } catch (err) {
      console.error('Error fetching PDF:', err);
      setError('Failed to load the PDF. Please try again later.');
      setPdfUrl(null);
    } finally {
      setLoading(false);
    }
  }, [pdfUrl]); 

  useEffect(() => {
    if (!user) {
      navigate('/auth/jwt/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!authLoading && user?.sub) {
      fetchPdf(user?.sub);
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [authLoading, user, fetchPdf, pdfUrl]);

  const handleReload = () => {
    if (user?.sub) {
      fetchPdf(user?.sub);
    }
  };

  if (authLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h4" align="center" sx={{ mb: 3 }}>
          Emploi de temps
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
        <PermissionBasedGuard permissions={['ACCESS_ORIENTATION']} hasContent>

    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4" align="center" sx={{ mb: 3 }}>
        Emploi de temps
      </Typography>

      <Box
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '800px',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button variant="outlined" onClick={handleReload}>
              Try Again
            </Button>
          </Box>
        )}

        {!loading && !error && pdfUrl && (
          <iframe
            src={pdfUrl}
            title="Emploi de temps PDF"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        )}
      </Box>
    </Container>
        </PermissionBasedGuard>

  );
}