import PropTypes from 'prop-types';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

// import { fCurrency } from 'src/utils/format-number';

import { format, parseISO, isSameDay } from 'date-fns';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export default function OrderTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow , filters }) {
  const { nomPrenom, nomClasse, codeModule, designationMatiere, nbHeureAdd, chargeH, cours } = row;

  // Filtrer les cours selon la date sélectionnée
  const filteredCours = filters.coursDate 
  ? cours.filter(c => isSameDay(parseISO(c.dateCours), new Date(filters.coursDate)))
  : cours;
// const { semestreSelectionne, semestres , anneeSelectionne,cursusSelectionne } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres
  
  // const [employesCours, setEmployesCours] = useState([]);

  // useEffect(() => {
  //   courService.getEmployesWithCours(semestreSelectionne, cursusSelectionne)
  //     .then((data) => {
  //       console.log('Données récupérées:', data);

  //       setEmployesCours(data);
  //     })
  //     .catch((err) => {
  //       console.error('Erreur lors de la récupération de données:', err);
  //     });
  // }, [semestreSelectionne, cursusSelectionne]);
  const confirm = useBoolean();

  const collapse = useBoolean();

  const getFullDateTime = (date, time) => new Date(`${date}T${time}`);

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          alt={nomPrenom}
          src={`/static/images/avatar/${row.idEmploye}.jpg`}
          sx={{ mr: 2 }}
        />
        <ListItemText
          primary={nomPrenom}
          secondary={row.email}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </TableCell>
  
      <TableCell>
        <ListItemText
          primary={nomClasse}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>
  
      <TableCell>
        <ListItemText
          primary={designationMatiere}
          secondary={codeModule}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>
  
      <TableCell>
        {nbHeureAdd}/ {chargeH}
      </TableCell>
  
      <TableCell>
        <Label
          variant="soft"
          color={row.nbHeureAdd === row.chargeH ? 'success' : 'warning'}
        >
          {row.nbHeureAdd === row.chargeH ? 'Completé' : 'En cours'}
        </Label>
      </TableCell>
  
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover',
            }),
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>
{/*   
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton> */}
      </TableCell>
    </TableRow>
  );
  
  
  const renderSecondary = (
    <TableRow> 
    <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
      <Collapse
        in={collapse.value}
        timeout="auto"
        unmountOnExit
        sx={{ bgcolor: 'background.neutral' }}
      >
        <Stack component={Paper} sx={{ m: 1.5 }}>
          {filteredCours && filteredCours.length > 0 &&
            filteredCours.map((cour, index) => (
              <Stack
                key={`${cour.dateCours}-${cour.plageHoraire?.heureDebut || index}`}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{
                  p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                  },
                }}
              >
                <ListItemText
                  primary={format(parseISO(cour.dateCours), 'dd/MM/yyyy')}
                  secondary={
                    cour.plageHoraire?.heureDebut && cour.plageHoraire?.heureFin
                      ? `${format(getFullDateTime(cour.dateCours, cour.plageHoraire.heureDebut), 'HH:mm')} - ${format(getFullDateTime(cour.dateCours, cour.plageHoraire.heureFin), 'HH:mm')}`
                      : 'Horaire non défini'
                  }
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                    mt: 0.5,
                  }}
                />
              </Stack>
            ))}
        </Stack>
      </Collapse>
    </TableCell>
  </TableRow>
  );
  
  return (
    <>
      {renderPrimary}

      {renderSecondary}
{/* 
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      > 
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>
      </CustomPopover> */}

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

OrderTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  filters: PropTypes.object,

};
