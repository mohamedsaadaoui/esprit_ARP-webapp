import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { Grid, Dialog, Select, MenuItem, TextField, InputLabel, IconButton, DialogTitle, FormControl, DialogContent, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGlobalData } from 'src/globalDataProvider';
import plageHoraireService from 'src/services/emploi-services/plageHoraireService';
import annulerCoursService from 'src/services/emploi-services/annulerCoursService';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

export default function RattrapageTableRow({ row, selected, onEditRow, onDeleteRow, onRestoreRow , userPermissions}) {
  const { idannulation, cours, etat, motifAnnulation } = row;
  const { employes, modules, classeSemestres, datecours, idplagehoraire } = cours;

  const confirm = useBoolean();
  const popover = usePopover();
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newDate, setNewDate] = useState(null);
  // eslint-disable-next-line react/prop-types
  const [newPlageHoraire, setNewPlageHoraire] = useState(idplagehoraire.id || '');
  const [plagesHoraires, setPlagesHoraires] = useState([]);
  const [motifs, setMotifs] = useState([]);
  const [selectedMotif, setSelectedMotif] = useState(motifAnnulation.idmotif || '');
  const { enqueueSnackbar } = useSnackbar();
  const {  cursusSelectionne} = useGlobalData();
  const teacherNames = employes.map(emp => `${emp.nom} ${emp.prenom}`).join(', ') || 'Unknown Teacher';
  const moduleDesignations = modules.map(module => module.designation).join(', ') || 'Unknown Module';
  const classNames = classeSemestres.map(classe => classe.idClasse.nomClasse).join(', ') || 'Unknown Class';

  // eslint-disable-next-line no-nested-ternary
  const status = motifAnnulation.rattrapable ? (etat ? 'Rattrapé' : 'Non Rattrapé') : 'Non Rattrapable';
  // eslint-disable-next-line no-nested-ternary
  const statusColor = motifAnnulation.rattrapable ? (etat ? 'success' : 'warning') : 'error';

  useEffect(() => {
    const fetchPlagesHoraires = async () => {
      try {
        // Assurez-vous que cursusSelectionne a bien un id
        const data = await plageHoraireService.listerActivesPlagesHorairesParCursus(cursusSelectionne);
        setPlagesHoraires(data);
      } catch (error) {
        console.error('Erreur lors du chargement des plages horaires:', error);
      }
    };
    const fetchMotifs = async () => {
      try {
        const fetchedMotifs = await annulerCoursService.getAllMotifs();
        setMotifs(fetchedMotifs);
      } catch (error) {
        console.error('Erreur lors de la récupération des motifs :', error);
      }
    };
 
    // Appeler fetchMotifs lors de la première exécution
    fetchMotifs();
 
    // Appeler fetchPlagesHoraires seulement si cursusSelectionne est défini
    if (cursusSelectionne) {
      fetchPlagesHoraires();
    }
 
  }, [cursusSelectionne]);

  useEffect(() => {
    if (openEditDialog) {
      setSelectedMotif(motifAnnulation.idmotif);
    }
  }, [openEditDialog, motifAnnulation]);

  const handleRestoreClick = () => {
    setNewDate(new Date(datecours));
    setOpenRestoreDialog(true);
    popover.onClose();
  };

  const handleRestoreConfirm = async () => {
    try {
        const formattedDate = newDate.toISOString().split('T')[0];
        await annulerCoursService.restaurerEtModifierCours(idannulation, formattedDate, newPlageHoraire);
        setOpenRestoreDialog(false);
        enqueueSnackbar('Cours restauré avec succès!', { variant: 'success' });
        onRestoreRow();
    } catch (error) {
        console.error('Erreur lors de la restauration du cours :', error);
        enqueueSnackbar(error.message, { variant: 'error' });
    }
};
  const handleEditClick = () => {
    setOpenEditDialog(true);
    popover.onClose();
  };

  const handleUpdateMotif = async () => {
    if (selectedMotif) { 
      try {
        await annulerCoursService.updateMotif(idannulation, selectedMotif);
        enqueueSnackbar('Motif mis à jour avec succès!', { variant: 'success' });
        onRestoreRow();
        setOpenEditDialog(false);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du motif :', error);
        enqueueSnackbar(`Erreur : ${error.message}`, { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Veuillez sélectionner un motif.', { variant: 'warning' });
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={teacherNames} src={employes.length > 0 ? employes[0]?.avatarUrl : ''} sx={{ mr: 2 }} />
          <ListItemText
            primary={teacherNames}
            secondary={employes.map(emp => emp.email).join(', ') || 'No Email'}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{moduleDesignations}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{classNames}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{datecours}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {idplagehoraire?.codePlageHoraire || 'Unknown Code'}
        </TableCell>        
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{motifAnnulation.motif || 'Motif non spécifié'}</TableCell>
        <TableCell>
          <Label variant="soft" color={statusColor}>
            {status}
          </Label>
        </TableCell>
        <TableCell>

        {((userPermissions.includes('UPDATE_COUR_ANNULE') || userPermissions.includes('RESTAURER_COUR_ANNULE')) && (motifAnnulation.rattrapable || !motifAnnulation.rattrapable)  && !etat)  && (
            <IconButton onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
                  </TableCell>

      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {userPermissions.includes('UPDATE_COUR_ANNULE') && ( 
  <MenuItem onClick={handleEditClick} sx={{ color: 'error.main' }}>
    Modifier
  </MenuItem>
)}
       {userPermissions.includes('RESTAURER_COUR_ANNULE') && motifAnnulation.rattrapable && !etat && (
  <MenuItem onClick={handleRestoreClick} sx={{ color: 'error.main' }}>
    <Iconify icon="solar:restore-bold" />
    Restaurer
  </MenuItem>
)}
      </CustomPopover>

      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)}>
        <DialogTitle>Restaurer Cours</DialogTitle>
        <DialogContent>
          <TextField
            label="Enseignant"
            value={teacherNames}
            disabled
            fullWidth
            margin="normal"
          />
          <TextField
            label="Classe"
            value={classNames}
            disabled
            fullWidth
            margin="normal"
          />
          <TextField
            label="Module"
            value={moduleDesignations}
            disabled
            fullWidth
            margin="normal"
          />
          <Grid container spacing={2} marginTop={2}>
            <Grid item xs={12} sm={6}>
              <MobileDatePicker
                label="Date Cours"
                value={newDate}
                onChange={(date) => setNewDate(date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Plage Horaire</InputLabel>
                <Select
                  value={newPlageHoraire}
                  onChange={(e) => setNewPlageHoraire(e.target.value)}
                >
                  {plagesHoraires.map((plage) => (
                    <MenuItem key={plage.id} value={plage.id}>
                      {plage.codePlageHoraire}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestoreDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleRestoreConfirm} color="primary">
            Restaurer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Modifier Motif</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Enseignant"
                value={teacherNames}
                disabled
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Classe"
                value={classNames}
                disabled
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Module"
                value={moduleDesignations}
                disabled
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date Cours"
                value={datecours}
                disabled
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Plage Horaire"
                value={idplagehoraire?.codePlageHoraire || 'Unknown Code'}
                disabled
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Motif</InputLabel>
                <Select
                  value={selectedMotif}
                  onChange={(e) => setSelectedMotif(e.target.value)}
                >
                  {motifs.map((motifItem) => (
                    <MenuItem key={motifItem.idmotif} value={motifItem.idmotif}>
                      {motifItem.motif}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleUpdateMotif} color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete this item?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Supprimer
          </Button>
        }
      />
    </>
  );
}

RattrapageTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onRestoreRow: PropTypes.func.isRequired,
  row: PropTypes.shape({
    idannulation: PropTypes.number.isRequired,
    cours: PropTypes.shape({
      employes: PropTypes.arrayOf(
        PropTypes.shape({
          nom: PropTypes.string,
          prenom: PropTypes.string,
          email: PropTypes.string,
          avatarUrl: PropTypes.string,
        })
      ),
      modules: PropTypes.arrayOf(
        PropTypes.shape({
          designation: PropTypes.string,
        })
      ),
      classeSemestres: PropTypes.arrayOf(
        PropTypes.shape({
          idClasse: PropTypes.shape({
            nomClasse: PropTypes.string,
          }),
        })
      ),
      datecours: PropTypes.string,
      idplagehoraire: PropTypes.shape({
        codePlageHoraire: PropTypes.string,
      }),
    }).isRequired,
    dateAnnulation: PropTypes.string.isRequired,
    etat: PropTypes.bool.isRequired,
    motifAnnulation: PropTypes.shape({
      idmotif: PropTypes.number.isRequired,
      motif: PropTypes.string.isRequired,
      rattrapable: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  selected: PropTypes.bool,
  userPermissions: PropTypes.arrayOf(PropTypes.string).isRequired, 

};