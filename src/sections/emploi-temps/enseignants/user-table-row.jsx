import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import { ConfirmDialog } from 'src/components/custom-dialog'; // Importation du hook useNavigate
import { paths } from 'src/routes/paths'; // Assurez-vous d'importer ROOTS

// ----------------------------------------------------------------------

export default function UserTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onToggleAvailability }) {
  const { nom, prenom, email, avatarUrl, numeroTelephone, typeEnseignant, cin, etat } = row;
  const confirm = useBoolean();
  const navigate = useNavigate(); // Initialisation de navigate

  // Déterminez le statut
  const status = etat ? 'Active' : 'Banned'; // Utilisation de "Active" et "Banned" directement
  const statusColor = etat ? 'success' : 'error'; // Couleur basée sur l'état

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={`${nom} ${prenom}`} src={avatarUrl} sx={{ mr: 2 }} />
          <ListItemText
            primary={`${nom} ${prenom}`}
            secondary={email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{cin}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{numeroTelephone}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{typeEnseignant}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={statusColor} // Utilisation de la couleur basée sur l'état
          >
            {status} {/* Affichage du statut */}
          </Label>
        </TableCell>

        {/* Nouvelle colonne pour la disponibilité */}
      <TableCell>
  
    
  <Button
    variant="outlined"
    size="medium" // Taille ajustée pour une meilleure lisibilité
    onClick={() => {
      // eslint-disable-next-line react/prop-types
      navigate(paths.dashboard.disp(row.id));
    }}
    sx={{
      borderColor: 'primary.main',
      color: 'primary.main',
      bgcolor: 'white',
      '&:hover': {
        borderColor: 'primary.dark',
        color: 'white',
        backgroundColor: 'primary.dark',
      },
      borderRadius: '16px',
      padding: '6px 12px', // Correction du padding pour un meilleur rendu
      fontWeight: 'bold',
      fontSize: '0.875rem', // Taille de police légèrement augmentée
      minWidth: '160px', // Largeur minimale pour éviter un bouton trop petit
    }}
  >
    Gérer Disponibilité
  </Button>
</TableCell>

      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onToggleAvailability: PropTypes.func, // Ajout de la prop pour gérer la disponibilité
  row: PropTypes.shape({
    nom: PropTypes.string,
    prenom: PropTypes.string,
    avatarUrl: PropTypes.string,
    numeroTelephone: PropTypes.string,
    typeEnseignant: PropTypes.string,
    role: PropTypes.string,
    email: PropTypes.string,
    cin: PropTypes.string,
    etat: PropTypes.bool, // Ajout de la validation pour etat
  }).isRequired,
  selected: PropTypes.bool,
};