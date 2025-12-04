import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Virtuoso } from 'react-virtuoso';
import React, { useState, useEffect } from 'react';

import PersonIcon from '@mui/icons-material/Person';
import {
  Box,
  Card,
  Chip,
  Stack,
  Radio,
  Dialog,
  Button,
  Avatar,
  Typography,
  RadioGroup,
  DialogTitle,
  CardContent,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import EtudiantService from 'src/services/pfe-services/etudiantService';
import EncadrementExpertiseService from 'src/services/pfe-services/encadrementExpertiseService';

export default function AssignExpertDialog({ openDialog, handleCloseDialog, studentId,refreshData }) {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (openDialog && studentId) {
      EtudiantService.getStudentById(studentId)
        .then((res) => setStudent(res.data.data))
        .catch(() => setStudent(null));

      EncadrementExpertiseService.getAllExperts()
        .then((res) => setMentors(res.data.data))
        .catch(() => setMentors([]));
    }
  }, [openDialog, studentId]);

  
  const handleConfirm = () => {
    if (!student || !selectedMentor) return;

    // Récupérer l'id de l'encadrant sélectionné
    const mentor = mentors.find(
      (m) => `${m.prenom} ${m.nom}` === selectedMentor
    );
    if (!mentor) return;

    setLoading(true);
    EncadrementExpertiseService
      .AffectExpert(student.etudiantId, mentor.idEmploye)
      .then((response) => {
        refreshData();
        enqueueSnackbar(response.data.message, { variant: 'success',autoHideDuration: 2000 });
        setLoading(false);
        setSelectedMentor('');
        handleCloseDialog();
      })
      .catch((error) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error',autoHideDuration: 2000 });
        setLoading(false);
      });
  };

  const renderMentor = (mentor) => {
    const nomComplet = `${mentor.prenom} ${mentor.nom}`;
    return (
      <Card
        key={mentor.idEmploye}
        variant="outlined"
        sx={{
          borderColor: selectedMentor === nomComplet ? 'primary.main' : 'divider',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <FormControlLabel
          value={nomComplet}
          control={<Radio />}
          label=""
          sx={{ mr: 2 }}
        />
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <PersonIcon />
        </Avatar>
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            {nomComplet}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {mentor.email}
          </Typography>
          <Chip
            label={mentor.idSpecialiteEnseignant?.label || 'Spécialité inconnue'}
            size="small"
            color="secondary"
            sx={{ mt: 1 }}
          />
          {mentor.idSpecialiteEnseignant?.competences?.length > 0 && (
            <Box mt={1}>
              <Typography variant="caption" fontWeight="bold" gutterBottom>
                Compétences et skills :
              </Typography>
              <Stack spacing={1}>
                {mentor.idSpecialiteEnseignant.competences.map((comp) => (
                  <Stack
                    key={comp.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Chip
                      label={comp.label}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {comp.skills?.map((skill) => (
                        <Chip
                          key={skill.id}
                          label={skill.label}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
        <Box ml="auto" textAlign="right" minWidth={90}>
          <Typography variant="body2" fontWeight="bold">
            {mentor.expertises?.length || 0} expertises
          </Typography>
          <Typography variant="body2" color="success.main" fontWeight="bold">
            {mentor.nbEtudiants ?? 0} encadrements
          </Typography>
        </Box>
      </Card>
    );
  };

  return (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Assigner un expert</DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* Infos étudiant */}
        {student && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {student.prenom} {student.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.emailEtudiant}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip
                      label={student.codeSpecialite?.designationSpecialite || '---'}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Typography variant="subtitle1" gutterBottom>
          👥 Sélectionner un encadrant disponible
        </Typography>

        <RadioGroup
          value={selectedMentor}
          onChange={(e) => setSelectedMentor(e.target.value)}
        >
          <Box sx={{ height: 350 }}>
            <Virtuoso
              data={mentors}
              itemContent={(index, mentor) => (
                <Box onClick={() => setSelectedMentor(`${mentor.prenom} ${mentor.nom}`)}>
                  {renderMentor(mentor)}
                </Box>
              )}
              style={{ height: '100%' }}
            />
          </Box>
        </RadioGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseDialog}>Annuler</Button>
        <Button
          variant="contained"
          disabled={!selectedMentor || loading}
          onClick={handleConfirm}
        >
          {loading ? 'Traitement...' : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AssignExpertDialog.propTypes = {
  openDialog: PropTypes.bool.isRequired,
  handleCloseDialog: PropTypes.func.isRequired,
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refreshData: PropTypes.func.isRequired
  
};
