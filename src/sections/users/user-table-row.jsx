import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Tooltip, Checkbox, IconButton, ListItemIcon } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import userService from 'src/services/emploi-services/userService';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
 
export default function UserTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onToggleAvailability, fetchUsers }) {
  const { username, email, avatarUrl, status, roles } = row;
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const [editedUser, setEditedUser] = useState({ username, email, roles: [], status });
  const [allRoles, setAllRoles] = useState([]);
  const [statusOptions] = useState(['ACTIVE', 'INACTIVE']); // Options for status
  const { enqueueSnackbar } = useSnackbar(); 

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await userService.getAllRoles();
        setAllRoles(rolesData);
        if (roles && roles.length > 0) {
          setEditedUser(prev => ({ ...prev, roles: roles.map(role => role.id) })); // Store an array of role IDs
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    fetchRoles();
  }, [roles]);

  const handleEditSubmit = async () => {
    try {
      // eslint-disable-next-line no-shadow
      const { username, email, roles, status } = editedUser;

      const updatedUserDetails = {
        username,
        email,
        roles: roles.map(id => ({ id })), 
        status: status || status, 
      };

      await userService.updateUser(row.id, updatedUserDetails);
      if (onEditRow) {
        onEditRow(row.id, updatedUserDetails);
      }
      fetchUsers();
      quickEdit.onFalse();
      enqueueSnackbar('Mise à jour avec succés!', { variant: 'success' });
    } catch (error) {
      console.error('Failed to update user:', error);
      enqueueSnackbar('Failed to update user.', { variant: 'error' }); 
    }
  };

  const handleRoleChange = (event) => {
    const { target: { value } } = event;
    setEditedUser({ ...editedUser, roles: typeof value === 'string' ? value.split(',') : value });
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={`${username}`} src={avatarUrl} sx={{ mr: 2 }} />
          <ListItemText primary={`${username}`} secondary={email} />
        </TableCell>

        <TableCell>
  {roles && roles.length > 0
    ? roles.map(role => `${role.labelRole} - ${role.cursus?.nom || 'No Cursus'}`).join(', ')
    : 'No Role'}
</TableCell>

        <TableCell>
          <Label variant="soft" color={status === 'ACTIVE' ? 'success' : 'error'} sx={{ ml: 1 }}>
            {status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </Label>
          <Tooltip title="Quick Edit" placement="top" arrow  />

        </TableCell>
        <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>

      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={<Button variant="contained" color="error" onClick={onDeleteRow}>Delete</Button>}
      />

      {/* Quick Edit Dialog */}
      <Dialog open={quickEdit.value} onClose={quickEdit.onFalse}>
        <DialogTitle>Modifier Utilisateur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={editedUser.username}
            onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editedUser.email}
            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              multiple
              value={editedUser.roles}
              onChange={handleRoleChange}
              // eslint-disable-next-line no-shadow
              renderValue={(selected) => selected.map(id => allRoles.find(role => role.id === id)?.labelRole).join(', ')}
            >
              {allRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  <ListItemIcon>
                    <Checkbox checked={editedUser.roles.indexOf(role.id) > -1} />
                  </ListItemIcon>
                  <ListItemText primary={`${role.labelRole} - ${role.cursus?.nom || 'No Cursus'}`} />  
                                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={editedUser.status}
              onChange={(e) => setEditedUser({ ...editedUser, status: e.target.value })}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={quickEdit.onFalse} color="primary">Cancel</Button>
          <Button onClick={handleEditSubmit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onToggleAvailability: PropTypes.func.isRequired,
  row: PropTypes.shape({
    username: PropTypes.string,
    avatarUrl: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      labelRole: PropTypes.string,
    })),
    email: PropTypes.string,
    status: PropTypes.string.isRequired, 
    id: PropTypes.any,
  }).isRequired,
  selected: PropTypes.bool,
  fetchUsers: PropTypes.func.isRequired, 
};