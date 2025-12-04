import PropTypes from 'prop-types';
import { useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText, Stack } from '@mui/material';
import planTravailService from 'src/services/pfe-services/planTravailService';

export default function PlanTravailTableRow({ row, selected, onSelectRow, onUpdateRow }) {
  const popover = usePopover();
  const [openDetails, setOpenDetails] = useState(false);
  const [status, setStatus] = useState(row.etat);
  const [actionMessage, setActionMessage] = useState(null);

  // Extraire les technologies et tâches
  const technologies = row.details?.filter(d => d.typeDetail === 'Technologie') || [];
  const tasks = row.details?.filter(d => d.typeDetail === 'Tâche') || [];


    const handleStatusChange = async (newStatus) => {
    try {
      // Appel API pour mettre à jour le statut
      const updatedPlan = await planTravailService.updatePlanTravailStatus(row.id, newStatus);
      setStatus(newStatus);
      onUpdateRow(updatedPlan);
      setActionMessage({
        type: 'success',
        text: `Plan ${newStatus === 'APPROUVE' ? 'accepté' : 'rejeté'} avec succès`
      });
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour du statut'
      });
    }
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setActionMessage(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Typography variant="body2">{row.etudiantId || '-'}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{row.etudiantNom || '-'}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{row.etudiantPrenom || '-'}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {row.titre || '-'}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{row.entreprise?.nomEntreprise || '-'}</Typography>
        </TableCell>

        <TableCell>
          <Label
            color={
              (status === 'EN_ATTENTE' && 'info') ||
              (status === 'APPROUVE' && 'success') ||
              (status === 'REJETE' && 'error') ||
              'default'
            }
          >
            {status || 'Pas de plan'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            setOpenDetails(true);
            popover.onClose();
          }}
        >
          <Iconify icon="eva:eye-fill" />
          Détails
        </MenuItem>

         <MenuItem
          onClick={() => {
            handleStatusChange('APPROUVEE');
            popover.onClose();
          }}
          sx={{ color: 'success.main' }}
        >
          Approuver
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleStatusChange('REJETEE');
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Rejeter
        </MenuItem>

      </CustomPopover>

      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="md" fullWidth>
<DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6">Détails du plan de travail</Typography>
            <Label
              color={
                (status === 'EN_ATTENTE' && 'warning') ||
                (status === 'APPROUVE' && 'success') ||
                (status === 'REJETE' && 'error') ||
                'default'
              }
            >
              {status || 'Non défini'}
            </Label>
          </Stack>
        </DialogTitle>        
        <DialogContent dividers>
          {actionMessage && (
            <Alert severity={actionMessage.type} sx={{ mb: 2 }}>
              {actionMessage.text}
            </Alert>
          )}
          <Typography variant="h6" gutterBottom>
            Informations générales
          </Typography>
          <Typography><strong>Titre:</strong> {row.titre}</Typography>
          <Typography><strong>Description:</strong> {row.description}</Typography>
          <Typography><strong>Problématique:</strong> {row.problematique}</Typography>
          <Typography><strong>Étudiant:</strong> {row.etudiantPrenom} {row.etudiantNom}</Typography>
          <Typography><strong>Email:</strong> {row.etudiantEmail}</Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Technologies utilisées
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {technologies.map((tech, index) => (
              <Chip key={index} label={tech.description} />
            ))}
            {technologies.length === 0 && <Typography variant="body2">Aucune technologie spécifiée</Typography>}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Tâches/Fonctionnalités
          </Typography>
          <List dense>
            {tasks.map((task, index) => (
              <ListItem key={index}>
                <ListItemText primary={task.description} />
              </ListItem>
            ))}
            {tasks.length === 0 && <Typography variant="body2">Aucune tâche définie</Typography>}
          </List>
        </DialogContent>

<DialogActions>
          <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between' }}>
            <Box>
              {status !== 'APPROUVE' && (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleStatusChange('APPROUVE')}
                >
                    Approuver
                </Button>
              )}
              {status !== 'REJETE' && (
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={() => handleStatusChange('REJETE')}
                  sx={{ ml: 1 }}
                >
                  Rejeter
                </Button>
              )}
            </Box>
            
            <Box>
              
              <Button 
                variant="outlined" 
                onClick={handleCloseDetails}
              >
                Fermer
              </Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

PlanTravailTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onSelectRow: PropTypes.func,
//  onDeleteRow: PropTypes.func,
//   onEditRow: PropTypes.func,
//   onViewDetails: PropTypes.func,
  onUpdateRow: PropTypes.func,
};