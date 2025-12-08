import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Avatar,
  AvatarGroup,
  Box,
  Chip,
  Dialog,
  Button,
  Typography,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  School as AcademicIcon,
  Business as EnterpriseIcon,
  Gavel as ExpertIcon,
  RecordVoiceOver as SoutenanceIcon,
  PlayArrow as PlayArrowIcon,
  DoneAll as DoneAllIcon,
  Block as BlockIcon,
  AccessTime as AccessTimeIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Label from 'src/components/label';

const SoutenanceTableRow = ({ row, onEditRow, onDeleteRow }) => {
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [selectedGrilleType, setSelectedGrilleType] = useState('');
  const navigate = useNavigate(); // Hook pour la navigation

  const handleOpenEvaluation = () => {
    setEvaluationDialogOpen(true);
  };

  const handleCloseEvaluation = () => {
    setEvaluationDialogOpen(false);
    setSelectedGrilleType('');
  };

  // 🆕 FONCTION : Redirection vers EvaluationWorkflow
  const handleStartEvaluation = () => {
    if (!selectedGrilleType || !row.rawData?.idAffectationStage?.etudiant?.etudiantId) {
      console.error('Données manquantes pour la redirection');
      return;
    }

    // Fermer le dialogue
    handleCloseEvaluation();

    // Récupérer l'ID de l'étudiant
    const etudiantId = row.rawData.idAffectationStage.etudiant.etudiantId;
    
    // Naviguer vers EvaluationWorkflow avec les paramètres
    navigate('/pfe/grille/EvaluationWorkflow', {
      state: {
        selectedEtudiant: etudiantId,
        selectedGrilleType: selectedGrilleType,
        soutenanceId: row.id,
        etudiantInfo: {
          nom: row.etudiant,
          departement: row.rawData?.idAffectationStage?.etudiant?.departement,
          option: row.rawData?.idAffectationStage?.etudiant?.option,
          entreprise: row.rawData?.idAffectationStage?.entreprise?.nomEntreprise,
          projet: row.rawData?.idAffectationStage?.projet?.titreProjet
        }
      }
    });
  };


  // 🆕 FONCTION : Couleurs basées sur StatutSoutenance (enum)
  const getStatusColor = (statutSoutenance) => {
    const colorsMap = {
      'EN_ATTENTE': 'warning',
      'PLANIFIEE': 'info',
      'EN_COURS': 'primary',
      'TERMINEE': 'success',
      'ANNULEE': 'error',
      'REPORTEE': 'secondary'
    };
    return colorsMap[statutSoutenance] || 'default';
  };

  // 🆕 FONCTION : Texte formaté pour le statut de soutenance
  const getStatusLabel = (statutSoutenance) => {
    const labelsMap = {
      'EN_ATTENTE': 'En Attente',
      'PLANIFIEE': 'Planifiée',
      'EN_COURS': 'En Cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée',
      'REPORTEE': 'Reportée'
    };
    return labelsMap[statutSoutenance] || statutSoutenance;
  };

  // 🆕 FONCTION : Icône pour le statut de soutenance
  const getStatusIcon = (statutSoutenance) => {
    const iconsMap = {
      'EN_ATTENTE': <AccessTimeIcon fontSize="small" />,
      'PLANIFIEE': <PlayArrowIcon fontSize="small" />,
      'EN_COURS': <PlayArrowIcon fontSize="small" />,
      'TERMINEE': <DoneAllIcon fontSize="small" />,
      'ANNULEE': <BlockIcon fontSize="small" />,
      'REPORTEE': <AccessTimeIcon fontSize="small" />
    };
    return iconsMap[statutSoutenance];
  };

  // 🆕 FONCTION : Vérifier si l'évaluation est disponible
  const isEvaluationAvailable = (statutSoutenance) => {
    // L'évaluation n'est disponible que pour les soutenances terminées
    return statutSoutenance === 'TERMINEE';
  };

  // 🆕 FONCTION : Vérifier si la modification est disponible
  const isEditAvailable = (statutSoutenance) => {
    // La modification est disponible pour tous sauf terminée et annulée
    return !['TERMINEE', 'ANNULEE'].includes(statutSoutenance);
  };

  // 🆕 FONCTION : Vérifier si la suppression est disponible
  const isDeleteAvailable = (statutSoutenance) => {
    // La suppression n'est disponible que pour les soutenances en attente
    return ['EN_ATTENTE', 'REPORTEE'].includes(statutSoutenance);
  };

  const getGrilleTypes = () => [
    { value: 'ACADEMIQUE', label: 'Grille Académique', icon: <AcademicIcon /> },
    { value: 'ENTREPRISE', label: 'Grille Entreprise', icon: <EnterpriseIcon /> },
    { value: 'EXPERT', label: 'Grille Expert', icon: <ExpertIcon /> },
    { value: 'SOUTENANCE', label: 'Grille Soutenance', icon: <SoutenanceIcon /> }
  ];

  return (
    <>
      <TableRow hover sx={{ 
        backgroundColor: row.statutSoutenance === 'EN_COURS' ? 'action.hover' : 'inherit',
        '&:hover': {
          backgroundColor: row.statutSoutenance === 'EN_COURS' ? 'action.selected' : 'action.hover'
        }
      }}>
        {/* ID */}
        <TableCell>
          <Label color="primary">#{row.id}</Label>
        </TableCell>

        {/* Étudiant */}
        <TableCell>
          <Box>
            <Typography variant="subtitle2" noWrap fontWeight="medium">
              {row.etudiant}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.rawData?.idAffectationStage?.etudiant?.emailEtudiant || 
               row.rawData?.idAffectationStage?.etudiant?.email}
            </Typography>
          </Box>
        </TableCell>

        {/* Date */}
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {row.date && row.date !== 'N/A' 
              ? new Date(row.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : 'Non planifiée'
            }
          </Typography>
        </TableCell>

        {/* Horaire */}
        <TableCell>
          {row.heure && row.heure !== 'N/A' ? (
            <Chip 
              label={row.heure} 
              size="small" 
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 'medium' }}
            />
          ) : (
            <Chip 
              label="Non défini" 
              size="small" 
              variant="outlined"
              color="default"
            />
          )}
        </TableCell>

        {/* Salle */}
        <TableCell>
          {row.salle && row.salle !== 'N/A' ? (
            <Chip 
              label={row.salle} 
              size="small" 
              color="secondary"
              sx={{ fontWeight: 'medium' }}
            />
          ) : (
            <Chip 
              label="Non attribuée" 
              size="small" 
              color="default"
              variant="outlined"
            />
          )}
        </TableCell>

        {/* Président */}
        <TableCell>
          <Typography variant="body2" noWrap fontWeight="medium">
            {row.president !== 'N/A' ? row.president : 'Non désigné'}
          </Typography>
        </TableCell>

        {/* Membres du jury */}
        <TableCell>
          {row.membres && row.membres.length > 0 ? (
            <AvatarGroup max={3}>
              {row.membres.map((membre, index) => (
                <Tooltip 
                  key={index} 
                  title={`${membre.prenom || ''} ${membre.nom || ''}`.trim() || 'Membre du jury'}
                >
                  <Avatar 
                    src={membre.photo}
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {(membre.prenom?.[0] || 'M')}{(membre.nom?.[0] || 'J')}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          ) : (
            <Chip 
              label="Aucun membre" 
              size="small" 
              variant="outlined"
              color="default"
            />
          )}
        </TableCell>

        {/* 🆕 Statut Soutenance */}
        <TableCell>
          <Label 
            color={getStatusColor(row.statutSoutenance)}
            startIcon={getStatusIcon(row.statutSoutenance)}
            sx={{ 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            {getStatusLabel(row.statutSoutenance)}
          </Label>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* Bouton Évaluation */}
            <Tooltip 
              title={
                isEvaluationAvailable(row.statutSoutenance) 
                  ? "Évaluer cette soutenance"
                  : "Évaluation disponible seulement pour les soutenances terminées"
              }
            >
              <span>
                <IconButton 
                  color="primary"
                  onClick={handleOpenEvaluation}
                  disabled={!isEvaluationAvailable(row.statutSoutenance)}
                  sx={{
                    backgroundColor: isEvaluationAvailable(row.statutSoutenance) 
                      ? 'primary.light' 
                      : 'action.disabledBackground',
                    '&:hover': {
                      backgroundColor: isEvaluationAvailable(row.statutSoutenance) 
                        ? 'primary.main' 
                        : 'action.disabledBackground',
                      color: isEvaluationAvailable(row.statutSoutenance) ? 'white' : 'action.disabled'
                    },
                    opacity: isEvaluationAvailable(row.statutSoutenance) ? 1 : 0.5
                  }}
                >
                  <AssessmentIcon />
                </IconButton>
              </span>
            </Tooltip>



            {/* Bouton Modifier */}
            <Tooltip 
              title={
                isEditAvailable(row.statutSoutenance)
                  ? "Modifier la soutenance"
                  : "Modification non disponible pour ce statut"
              }
            >
              <span>
                <IconButton 
                  color="info" 
                  onClick={() => onEditRow(row)}
                  disabled={!isEditAvailable(row.statutSoutenance)}
                  sx={{
                    opacity: isEditAvailable(row.statutSoutenance) ? 1 : 0.5
                  }}
                >
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>

            {/* Bouton Supprimer */}
            <Tooltip 
              title={
                isDeleteAvailable(row.statutSoutenance)
                  ? "Supprimer la soutenance"
                  : "Suppression non disponible pour ce statut"
              }
            >
              <span>
                <IconButton 
                  color="error" 
                  onClick={() => onDeleteRow(row)}
                  disabled={!isDeleteAvailable(row.statutSoutenance)}
                  sx={{
                    opacity: isDeleteAvailable(row.statutSoutenance) ? 1 : 0.5
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      {/* Dialogue de sélection du type de grille */}
      <Dialog 
        open={evaluationDialogOpen} 
        onClose={handleCloseEvaluation}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
            📝 Évaluation de la Soutenance
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }} align="center">
            Choisissez le type de grille d'évaluation pour<br />
            <strong>{row.etudiant}</strong>
          </Typography>

          {/* 🆕 Alert pour le statut */}
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            icon={<AssessmentIcon />}
          >
            Statut actuel : <strong>{getStatusLabel(row.statutSoutenance)}</strong>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {getGrilleTypes().map((type) => (
              <Button
                key={type.value}
                variant={selectedGrilleType === type.value ? "contained" : "outlined"}
                startIcon={type.icon}
                endIcon={<OpenInNewIcon />}
                onClick={() => setSelectedGrilleType(type.value)}
                sx={{
                  justifyContent: 'flex-start',
                  py: 2,
                  textAlign: 'left',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: selectedGrilleType === type.value ? 'none' : 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {type.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {type.value === 'ACADEMIQUE' && 'Évaluation académique standard'}
                    {type.value === 'ENTREPRISE' && 'Critères professionnels et techniques'}
                    {type.value === 'EXPERT' && 'Évaluation par des experts métier'}
                    {type.value === 'SOUTENANCE' && 'Performance durant la soutenance'}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleCloseEvaluation}
              variant="outlined"
            >
              Annuler
            </Button>
            <Button 
              variant="contained" 
              disabled={!selectedGrilleType}
              onClick={handleStartEvaluation}
              startIcon={<OpenInNewIcon />}
            >
              Ouvrir l'évaluation
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );  
};

export default SoutenanceTableRow;