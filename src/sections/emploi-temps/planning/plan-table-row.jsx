import PropTypes from 'prop-types';
 
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { useBoolean } from 'src/hooks/use-boolean';
 
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
 
// ----------------------------------------------------------------------
 
export default function PlanTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const { nomClasse, codeModule,chargeH,  employes,designation } = row;
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
 
 
 
  return (
    <>
      <TableRow hover selected={selected}>
     
     
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{nomClasse}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{codeModule}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{designation}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{chargeH}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
  {employes.map((employe, index) => (
    <span key={index}>
      {employe.nomCompletEmploye}
      {index < employes.length - 1 && ', '}
    </span>
  ))}
</TableCell>
       
       
 
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {/* <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
 
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        </TableCell>
      </TableRow>
 
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
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>
 
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
 
PlanTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.shape({
    id:PropTypes.string,
    nomClasse: PropTypes.string,
    codeModule: PropTypes.string,
    chargeH: PropTypes.string,
    employes: PropTypes.string,
    designation : PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool,
};