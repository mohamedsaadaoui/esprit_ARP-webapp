import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
 
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
 
import { useBoolean } from 'src/hooks/use-boolean';

import retardService from 'src/services/emploi-services/retardService'; // Import your service
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
 
 
// ----------------------------------------------------------------------
 
export default function RetardTableRow({ row, selected, onEditRow, onDeleteRow, refreshedList,userPermissions }) {
  const { id, idcours, idEmploye, dureeRetard, avatarUrl } = row;
  const confirm = useBoolean();
  const popover = usePopover();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [dureeRetardValue, setDureeRetardValue] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
 
 
  const methods = useForm();
 
  const parseTimeStringToDate = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    return new Date(1970, 0, 1, hours, minutes); // Date fixe pour l'heure
  };
 
  const handleEdit = () => {
    const formattedTime = parseTimeStringToDate(dureeRetard);
    setDureeRetardValue(formattedTime);
    setOpenEditDialog(true);
    popover.onClose();
  };
 
  const handleSubmitEdit = async (data) => {
    try {
        const timeString = dureeRetardValue
            ? `${dureeRetardValue.getHours().toString().padStart(2, '0')}:${dureeRetardValue.getMinutes().toString().padStart(2, '0')}`
            : '';
 
        // Attendez la réponse du backend pour récupérer le message
        const response = await retardService.updateRetard(id, { dureeRetard: timeString });
        refreshedList();
 
        // Utilisez le message de succès du backend
        const successMessage = response.data?.message || 'Modification réussie!';
        enqueueSnackbar(successMessage, { variant: 'success' });
 
    } catch (error) {
        console.error('Error updating retard:', error);
       
        // Afficher un message d'erreur
        enqueueSnackbar('Erreur lors de la modification.', { variant: 'error' });
       
    } finally {
        setOpenEditDialog(false);
    }
};
 
  const handleDelete = async () => {
    try {
      await retardService.deleteRetard(id);
      // eslint-disable-next-line no-unused-expressions
      onDeleteRow && onDeleteRow();
    } catch (error) {
      console.error('Error deleting retard:', error);
    } finally {
      confirm.onFalse();
    }
  };
 
  const formatDurationToMinutes = (durationStr) => {
    if (!durationStr) return '';
    const [hours, minutes] = durationStr.split(':');
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  };
 
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };
 
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={`${idEmploye.prenom} ${idEmploye.nom}`} src={avatarUrl} sx={{ mr: 2 }} />
          <ListItemText
            primary={`${idEmploye.prenom} ${idEmploye.nom}`}
            secondary={idEmploye.email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {idcours.modules.map((cours, index) => (
            <span key={index}>
              {cours.designation}
              {index < idcours.modules.length - 1 && ', '}
            </span>
          ))}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {idcours.classeSemestres.map((cs, index) => (
            <span key={index}>
              {cs.idClasse.nomClasse}
              {index < idcours.modules.length - 1 && ', '}
            </span>
          ))}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idcours.datecours}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {formatTime(idcours.idplagehoraire.heureDebut)} à {formatTime(idcours.idplagehoraire.heureFin)}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {formatDurationToMinutes(dureeRetard)} minutes
        </TableCell>
 
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
  {(userPermissions.includes('UPDATE_RETARD') || userPermissions.includes('DELETE_RETARD')) && (
    <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
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
        {userPermissions.includes('UPDATE_RETARD') && (
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Modifier
          </MenuItem>
        )}
        {userPermissions.includes('DELETE_RETARD') && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Supprimer
          </MenuItem>
        )}
      </CustomPopover>
      <Dialog
  open={openEditDialog}
  onClose={() => setOpenEditDialog(false)}
  sx={{
    '& .MuiDialog-paper': {
      minWidth: '400px',
      maxWidth: '95%',
      borderRadius: '8px',
      py: 1
    }
  }}
>
  <DialogTitle
    sx={{
      fontSize: '1.1rem',
      fontWeight: 600,
      textAlign: 'center',
      py: 1
    }}
  >
    Modifier la durée de retard
  </DialogTitle>
 
  <DialogContent sx={{ pt: 1 }}>
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmitEdit)}>
        <Stack spacing={2}>
          <Controller
            name="dureeRetard"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <TimePicker
                {...field}
                value={dureeRetardValue}
                onChange={(newValue) => {
                  setDureeRetardValue(newValue);
                  field.onChange(newValue);
                }}
                ampm={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!error}
                    placeholder="HH:MM"
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: '6px'
                      }
                    }}
                  />
                )}
              />
            )}
          />
 
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="small"
            sx={{
              py: 2.5,
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            Confirmer
          </Button>
        </Stack>
      </form>
    </FormProvider>
  </DialogContent>
</Dialog>
 
 
 
 
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Confirmer la Suppression
"
        content="Êtes-vous sûr de vouloir supprimer ce retard ?"
        action={
          <Button variant="contained" style={{ backgroundColor: 'black', color: 'white' }} onClick={handleDelete}>
          Supprimer
        </Button>
        }
      />
    </>
  );
}
 
RetardTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.shape({
    id: PropTypes.string,
    idEmploye: PropTypes.object,
    idcours: PropTypes.object,
    dureeRetard: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool,
  refreshedList: PropTypes.func.isRequired,
    userPermissions: PropTypes.arrayOf(PropTypes.string).isRequired, 
  
};