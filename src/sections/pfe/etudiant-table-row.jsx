/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'src/components/snackbar';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Label from 'src/components/label';
import conventionService from 'src/services/pfe-services/conventionService';
import { useState } from 'react';


export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onUpdateRow,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const {
    etudiantId,
    emailEtudiant,
    prenom,
    nom,
    telephone,
    dateNaissance,
    sexe,
    idConvention,
    statutConvention,
  } = row;

  const actionsPopover = usePopover();

  const [treatmentStatus, setTreatmentStatus] = useState(null);
  const confirmTreatment= useBoolean();

  const handleClick = () => {
    router.push(paths.dashboard.user.edit(etudiantId));
  };

    const handleTreatConvention = (newStatus) => {
    setTreatmentStatus(newStatus);
    confirmTreatment.onTrue();
    actionsPopover.onClose();
  };

    const confirmTreatmentAction = async () => {
    try {
      // Appel API pour mettre à jour le statut
      await conventionService.updateConventionStatus(
        row.idConvention, 
        treatmentStatus
      );
      
      // Mettre à jour localement
      onUpdateRow({
        ...row, 
        statutConvention: treatmentStatus,
        id: row.idConvention // Assurez-vous d'utiliser l'identifiant correct
      });      
      enqueueSnackbar(
        treatmentStatus === 'APPROUVEE' 
          ? 'Convention approuvée avec succès' 
          : 'Convention rejetée avec succès',
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' });
    } finally {
      confirmTreatment.onFalse();
      setTreatmentStatus(null);
    }
  };


  const handleToggleActivation = async () => {

  };
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }} onClick={handleClick}>
          <Avatar alt={nom} src={nom} sx={{ mr: 2 }} />
        </TableCell>

        <TableCell>
          {etudiantId}
        </TableCell>

        <TableCell>{nom}</TableCell>
        
        {/* Prénom */}
        <TableCell>{prenom}</TableCell>
        
        {/* Email */}
        <TableCell>{emailEtudiant}</TableCell>

        <TableCell align="center">
          {telephone || 'N/A'}
        </TableCell>

        {/* <TableCell>
          <Stack direction="column" spacing={1}>
            {
              statutConvention ? (
                <Label
                  variant="soft" 
                  color={statutConvention === 'EN_ATTENTE' ? 'info' : statutConvention === 'APPROUVEE' ? 'success' : 'error'}
                  sx={{ width: 'fit-content' }}
                >
                  {statutConvention}  
                </Label>
              ) : ( 
                <Label variant="soft" color="default" sx={{ width: 'fit-content' }}>
                  Pas de convention
                </Label>
              )
            }            

          </Stack>
        </TableCell> */}

                <TableCell>
          <Label
            variant="soft"
            color={
              !statutConvention ? 'warning' :
              statutConvention === 'EN_ATTENTE' ? 'info' :
              statutConvention === 'APPROUVEE' ? 'success' : 'error'
            }
            sx={{ width: 'fit-content' }}
          >
            {!statutConvention ? 'Pas de convention' : 
             statutConvention === 'EN_ATTENTE' ? 'En attente' :
              statutConvention === 'SIGNED' ? 'Signée' :
             statutConvention === 'APPROUVEE' ? 'approuvée' : 'Rejetée'}
          </Label>
        </TableCell>



        {(statutConvention === 'EN_ATTENTE' || statutConvention === 'APPROUVEE' || 
        statutConvention === 'REJETEE') &&
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton
            color={actionsPopover.open ? 'inherit' : 'default'}
            onClick={actionsPopover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
        }

      </TableRow>

      <CustomPopover
        open={actionsPopover.open}
        onClose={actionsPopover.onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        {(statutConvention === 'EN_ATTENTE' || statutConvention === 'APPROUVEE' || 
        statutConvention === 'REJETEE') && (
          <>
            <MenuItem onClick={() => handleTreatConvention('APPROUVEE')}>
              <Iconify icon="eva:checkmark-circle-outline" />
              Approuver
            </MenuItem>
            <MenuItem 
              onClick={() => handleTreatConvention('REJETEE')} 
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="eva:close-circle-outline" />
              Rejeter
            </MenuItem>

          <MenuItem onClick={() => onEditRow(etudiantId)}>
          <Iconify icon="eva:edit-fill" />
          Modifier
        </MenuItem>
          </>
        )}
        

        
      </CustomPopover>

      {/* Popup de confirmation */}
      <ConfirmDialog
        open={confirmTreatment.value}
        onClose={confirmTreatment.onFalse}
        title={
          treatmentStatus === 'APPROUVEE' 
            ? 'Approuver la convention' 
            : 'Rejeter la convention'
        }
        content={
          treatmentStatus === 'APPROUVEE'
            ? 'Êtes-vous sûr de vouloir approuver cette convention ?'
            : 'Êtes-vous sûr de vouloir rejeter cette convention ?'
        }
        action={
          <Button
            variant="contained"
            color={treatmentStatus === 'APPROUVEE' ? 'success' : 'error'}
            onClick={confirmTreatmentAction}
          >
            Confirmer
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onUpdateRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
