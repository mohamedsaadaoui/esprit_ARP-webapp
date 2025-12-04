import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import { Switch, Typography, DialogContent } from '@mui/material';

import salleService from 'src/services/emploi-services/salleService';
import cursusService from 'src/services/emploi-services/cursusService';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

export default function SalleTableRow({ row, onToggleStatut, onDeleteRow, userPermissions }) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [updatedSalle, setUpdatedSalle] = useState({ ...row });
  const [loadingStatut, setLoadingStatut] = useState(false);
  const [cursusList, setCursusList] = useState([]);
  const popover = usePopover();

  useEffect(() => {
    const fetchCursus = async () => {
      try {
        const data = await cursusService.getAllCursus();
        setCursusList(data);
        
        // Si le cursus existe mais n'a pas les détails complets
        if (row.cursus?.id && !row.cursus.nom) {
          const fullCursus = data.find(c => c.id === row.cursus.id);
          if (fullCursus) {
            setUpdatedSalle(prev => ({
              ...prev,
              cursus: fullCursus
            }));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cursus:', error);
      }
    };
    fetchCursus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.cursus?.id]);

  const handleDelete = () => {
    salleService
      .deleteSalle(row.id)
      .then(() => {
        onDeleteRow(row.id);
        handleCloseDeleteDialog();
      })
      .catch((error) => {
        console.error('Erreur de suppression:', error);
      });
  };

  const handleOpenDeleteDialog = () => setOpenDeleteDialog(true);
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);
  const handleEditRow = () => setOpenEditDialog(true);
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setUpdatedSalle({ ...row });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
  
    if (name === 'cursus') {
      const selectedCursus = cursusList.filter(c => value.includes(c.id));
      setUpdatedSalle(prev => ({
        ...prev,
        cursus: selectedCursus // Stocker un tableau de cursus
      }));
    } else {
      setUpdatedSalle(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleConfirmEdit = () => {
    salleService
      .updateSalle(updatedSalle.id, updatedSalle)
      .then(() => {
        console.log('Salle mise à jour avec succès:', updatedSalle);
        Object.assign(row, updatedSalle);
        handleCloseEditDialog();
      })
      .catch((error) => {
        console.error('Erreur lors de la mise à jour de la salle:', error);
      });
  };

  const handleToggleStatut = async () => {
    if (!userPermissions.includes('ACTIVATE_DEACTIVATE_SALLE')) {
      console.error("Permission denied: Cannot change status");
      return;
    }
  
    setLoadingStatut(true);
    try {
      const updatedSalleStatut = await salleService.activerDesactiverSalle(row.id);
      setUpdatedSalle(prev => ({ ...prev, statut: updatedSalleStatut.statut }));
      onToggleStatut({ ...row, statut: updatedSalleStatut.statut });
    } catch (error) {
      console.error('Erreur lors de l\'activation/désactivation de la salle:', error);
    } finally {
      setLoadingStatut(false);
    }
  };

  const { id, nom, capacite, typesalle, localisation, statut } = updatedSalle;

  return (
    <>
      <TableRow hover>
        <TableCell>{nom}</TableCell>
        <TableCell>{capacite}</TableCell>
        <TableCell>{typesalle}</TableCell>
        <TableCell>{localisation}</TableCell>
        <TableCell>
          {userPermissions.includes('ACTIVATE_DEACTIVATE_SALLE') ? (
            <Switch
              checked={statut}
              onChange={handleToggleStatut}
              color="primary"
              size="small"
              disabled={loadingStatut}
            />
          ) : (
            <Label
              variant="soft"
              color={statut ? 'success' : 'error'}
              sx={{ ml: 1 }}
            >
              {statut ? 'Active' : 'Inactive'}
            </Label>
          )}
        </TableCell>
        <TableCell align="right">
          {(userPermissions.includes('UPDATE_SALLE') || userPermissions.includes('DELETE_SALLE')) && (
            <IconButton onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} onClose={popover.onClose}>
        {userPermissions.includes('UPDATE_SALLE') && (
          <MenuItem
            onClick={() => {
              handleEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Modifier
          </MenuItem>
        )}
        {userPermissions.includes('DELETE_SALLE') && (
          <MenuItem
            onClick={() => { handleOpenDeleteDialog(); popover.onClose(); }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Supprimer
          </MenuItem>
        )}
      </CustomPopover>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Modifier la salle</DialogTitle>
        <DialogContent>
          <TextField
            name="nom"
            label="Nom"
            value={updatedSalle.nom}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="typesalle-label">Type de Salle</InputLabel>
            <Select
              labelId="typesalle-label"
              name="typesalle"
              value={updatedSalle.typesalle}
              onChange={handleChange}
            >
              <MenuItem value="Cours">Cours</MenuItem>
              <MenuItem value="TP">TP</MenuItem>
              <MenuItem value="Amphithéâtre">Amphithéâtre</MenuItem>
              <MenuItem value="Réunion">Réunion</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="capacite"
            label="Capacité"
            type="number"
            value={updatedSalle.capacite}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="localisation"
            label="Localisation"
            value={updatedSalle.localisation}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
         <FormControl fullWidth margin="normal">
  <InputLabel id="cursus-label">Cursus</InputLabel>
  <Select
    labelId="cursus-label"
    name="cursus"
    multiple
    value={updatedSalle.cursus?.map(c => c.id) || []} // Gérer plusieurs sélections
    onChange={handleChange}
    label="Cursus"
  >
    <MenuItem value="">
      <em>Aucun</em>
    </MenuItem>
    {cursusList.map((cursus) => (
      <MenuItem key={cursus.id} value={cursus.id}>
        {cursus.nom}
      </MenuItem>
    ))}
  </Select>
</FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Annuler</Button>
          <Button onClick={handleConfirmEdit} variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la Suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cette salle ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} style={{ color: 'black' }}>
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            style={{ backgroundColor: 'red', color: 'white' }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

SalleTableRow.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.any.isRequired,
    nom: PropTypes.string.isRequired,
    capacite: PropTypes.any.isRequired,
    typesalle: PropTypes.string.isRequired,
    localisation: PropTypes.string.isRequired,
    statut: PropTypes.bool.isRequired,
    cursus: PropTypes.shape({
      id: PropTypes.any,
      nom: PropTypes.string,
    }),
  }).isRequired,
  onToggleStatut: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
  userPermissions: PropTypes.arrayOf(PropTypes.string).isRequired,
};