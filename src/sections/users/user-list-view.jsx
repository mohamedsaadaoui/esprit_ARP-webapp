import { useState, useEffect,useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TableContainer from '@mui/material/TableContainer';
import { Grid, Select, ListItem, TableRow, TableCell, CardHeader, InputLabel, FormControl } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { _roles } from 'src/_mock';
import userService from 'src/services/emploi-services/userService';
import cursusService from 'src/services/emploi-services/cursusService';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TableHeadCustomSalle from 'src/components/table/table-head-customSalle';
import {
  useTable,
  getComparator,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import UserTableRow from './user-table-row';
import UserTableToolbar from './user-table-toolbar';

const TABLE_HEAD = [
  { id: 'username', label: 'Nom et Prénom',width: 250 },
  { id: 'role', label: 'Role', width: 180 },
  { id: 'status', label: 'État', width: 180 },
  { id: 'action', label: '', width: 50 },
];

const defaultFilters = {
  username: '',
  role: [],
  status: 'all',
  email: '',
  cin: '',
  numeroTelephone: '',
  typeEnseignant: [],
};

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}


export default function UserListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const addRoleDialog = useBoolean();
  const permissionsDialog = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [rolesData, setRolesData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [checked, setChecked] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cursusOptions, setCursusOptions] = useState([]); // State for cursus options
  const [selectedCursusId, setSelectedCursusId] = useState(''); 
  
  
  const fetchCursusOptions = async () => {
    try {
      const cursus = await cursusService.getAllCursus();
      setCursusOptions(cursus);
    } catch (error) {
      enqueueSnackbar(`Error fetching cursus: ${error.message}`, { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchCursusOptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const fetchUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      setTableData(users);
    } catch (error) {
      enqueueSnackbar(`Error fetching users: ${error.message}`, { variant: 'error' });
    }
  };

  const fetchRoles = async () => {
    try {
      const roles = await userService.getAllRoles();
      const rolesWithCount = roles.map(role => ({
        ...role,
        userCount: tableData.filter(user => user.role === role.labelRole).length
      }));
      setRolesData(rolesWithCount);
    } catch (error) {
      enqueueSnackbar(`Error fetching roles: ${error.message}`, { variant: 'error' });
    }
  };
  // Fetch all permissions
  const fetchAllPermissions = async () => {
    try {
      const permissions = await userService.getAllPermissions();
      setAvailablePermissions(permissions);
    } catch (error) {
      enqueueSnackbar(`Error fetching permissions: ${error.message}`, { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchCursusOptions();
    fetchUsers();
    fetchAllPermissions(); // Fetch permissions on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRolePermissions = async (roleId) => {
    try {
      const [allPermissions, rolePermissions] = await Promise.all([
        userService.getPermissionsNotInRole(roleId),
        userService.getPermissionsByRoleId(roleId)
      ]);

      setAvailablePermissions(not(allPermissions, rolePermissions));
      setAssignedPermissions(rolePermissions);
      setChecked([]); // Réinitialiser les cases cochées
    } catch (error) {
      enqueueSnackbar(`Error fetching permissions: ${error.message}`, { variant: 'error' });
    }
  };

  const handleManagePermissions = () => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole.id);
      permissionsDialog.onTrue();
    }
    handleCloseMenu();
  };

 
  const handleAddRole = async () => {
    if (!selectedCursusId) {
      console.error('Cursus invalide');
      enqueueSnackbar('Cursus invalide', { variant: 'error' });
      return;
    }

    try {
      const roleRequest = {
        labelRole: newRoleName,
      };
      const newRole = await userService.createRole(selectedCursusId, roleRequest); // Use selectedCursusId
      enqueueSnackbar('Rôle ajouté avec succès', { variant: 'success' });

      // Assign selected permissions to the new role
      const permissionIds = assignedPermissions.map(permission => permission.id);
      await userService.assignPermissionToRole(newRole.id, permissionIds);

      addRoleDialog.onFalse();
      setNewRoleName('');
      setSelectedCursusId(''); // Reset selected cursus ID
      setAssignedPermissions([]); // Reset assigned permissions
      fetchRoles();
    } catch (error) {
      console.error('Error adding role:', error);
      enqueueSnackbar(error.message || 'Erreur lors de l\'ajout du rôle', { variant: 'error' });
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      const permissionIds = assignedPermissions.map(permission => permission.id);
      await userService.assignPermissionToRole(selectedRole.id, permissionIds);
      enqueueSnackbar('Permissions mises à jour avec succès', { variant: 'success' });

      permissionsDialog.onFalse();
      setChecked([]);

    } catch (error) {
      console.error('Error saving permissions:', error);
      enqueueSnackbar(
        error.message || 'Erreur lors de la mise à jour des permissions',
        { variant: 'error' }
      );
    }
  };

  // Logique pour la gestion des transferts de permissions
  const leftChecked = intersection(checked, availablePermissions);
  const rightChecked = intersection(checked, assignedPermissions);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    setAssignedPermissions([...assignedPermissions, ...leftChecked]);
    setAvailablePermissions(not(availablePermissions, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setAvailablePermissions([...availablePermissions, ...rightChecked]);
    setAssignedPermissions(not(assignedPermissions, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title, items, withScroll = true) => (
    <Card>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        title={`${title}`}
      />
      <Divider />
      <List
        dense
        component="div"
        role="list"
        sx={{
          width: '100%',
          ...(withScroll && { 
            height: 200,
            overflow: 'auto'
          })
        }}
      >
        {items.map((item) => {
          // If item is an object, use a unique property (like id) for the key
          // and display a specific property (like actionName)
          const value = typeof item === 'object' ? item.actionName : item;
          const key = typeof item === 'object' ? item.id : item;
          
          const labelId = `transfer-list-item-${key}-label`;
          
          return (
            <ListItem
              key={key}  // Make sure this is unique
              role="listitem"
              button
              onClick={handleToggle(item)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(item) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (tableData.length > 0) {
      fetchRoles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const handleMenuClick = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liste des utilisateurs"
          links={[
            { name: 'Dashboard', href: paths.dashboard },
            { name: 'Utilisateur' },
          ]}
        />

        <Grid container spacing={3}>
          {/* Table principale - prend 8 colonnes sur 12 */}
          <Grid item xs={12} md={8}>
            <Card>
              <UserTableToolbar
                filters={filters}
                roleOptions={_roles}
                onFilters={handleFilters} 
                fetchUsers={fetchUsers}
              />

              <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                <TableSelectedAction
                  dense={table.dense}
                  numSelected={table.selected.length}
                  rowCount={dataFiltered.length}
                  // eslint-disable-next-line no-shadow
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                  action={
                    <Tooltip title="Delete">
                      <IconButton color="primary" onClick={confirm.onTrue}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  }
                />

                <Scrollbar>
                  <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 600 }}>
                    <TableHeadCustomSalle
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={dataFiltered.length}
                      numSelected={table.selected.length}
                      onSort={table.onSort}
                      // eslint-disable-next-line no-shadow
                      onSelectAllRows={(checked) =>
                        table.onSelectAllRows(
                          checked,
                          dataFiltered.map((row) => row.id)
                        )
                      }
                    />

                    <TableBody>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <UserTableRow
  key={row.id}
  row={row}
  fetchUsers={fetchUsers} // Ajoutez ceci pour passer fetchUsers
/>
                        ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>

              <TablePaginationCustom
                count={dataFiltered.length}
                page={table.page}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onRowsPerPageChange={table.onChangeRowsPerPage}
                dense={table.dense}
                onChangeDense={table.onChangeDense}
              />
            </Card>
          </Grid>

          {/* Table des rôles - prend 4 colonnes sur 12 */}
          <Grid item xs={12} md={4}>
            <Card>
              <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CustomBreadcrumbs
                  heading="Liste des Rôles"
                  links={[
                    { name: 'Dashboard', href: paths.dashboard },
                    { name: 'Rôles' },
                  ]}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={addRoleDialog.onTrue}
                >
                  Ajouter Rôle
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHeadCustomSalle
                    headLabel={[
                      { id: 'name', label: 'Rôle' },
                      { id: 'actions', label: "Actions", align: 'right' },
                    ]}
                  />
                  <TableBody>
                    {rolesData.map((role) => (
                      <TableRow key={role.id || role.name}>
<TableCell>
  {role.labelRole ? `${role.labelRole} - ${role.cursus?.nom || 'No Cursus'}` : role.name}
</TableCell>                       
 <TableCell align="right">
                          <IconButton
                            onClick={(event) => handleMenuClick(event, role)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Container>

       
       {/* Dialog pour ajouter un nouveau rôle */}
{/* Dialog pour ajouter un nouveau rôle */}
<Dialog
  open={addRoleDialog.value}
  onClose={addRoleDialog.onFalse}
  maxWidth="sm" // Set the maximum width to small
  fullWidth // Allow the dialog to take full width
>
  <DialogTitle>Ajouter un nouveau rôle</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      id="roleName"
      label="Nom du rôle"
      type="text"
      fullWidth // Ensure the TextField takes the full width
      variant="outlined" // Use outlined for better compatibility
      value={newRoleName}
      onChange={(e) => setNewRoleName(e.target.value)}
    />
    <FormControl fullWidth margin="dense">
      <InputLabel>Cursus</InputLabel>
      <Select
        value={selectedCursusId}
        onChange={(e) => setSelectedCursusId(e.target.value)}
      >
        {cursusOptions.map(cursus => (
          <MenuItem key={cursus.id} value={cursus.id}>
            {cursus.nom}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Permissions selection */}
    <FormControl fullWidth margin="dense">
      <InputLabel>Permissions</InputLabel>
      <Select
        multiple
        value={assignedPermissions}
        onChange={(e) => setAssignedPermissions(e.target.value)}
        renderValue={(selected) => selected.map(permission => permission.actionName).join(', ')}
      >
        {availablePermissions.map(permission => (
          <MenuItem key={permission.id} value={permission}>
            <ListItemIcon>
              <Checkbox checked={assignedPermissions.indexOf(permission) > -1} />
            </ListItemIcon>
            <ListItemText primary={permission.actionName} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={addRoleDialog.onFalse}>Annuler</Button>
    <Button onClick={handleAddRole} color="primary">
      Ajouter
    </Button>
  </DialogActions>
</Dialog>

      {/* Dialog pour gérer les permissions */}
     {/* Dialog pour gérer les permissions */}
{/* Dialog pour gérer les permissions */}
{/* Dialog pour gérer les permissions */}
<Dialog
  open={permissionsDialog.value}
  onClose={permissionsDialog.onFalse}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>
    Gérer les permissions pour le rôle: {selectedRole?.labelRole}
  </DialogTitle>
  <DialogContent>
    <Grid container justifyContent="space-between" sx={{ p: 3 }}>
      <Grid item xs={5} sx={{ minWidth: '250px', maxWidth: '300px', overflow: 'auto', height: '300px' }}>
        {customList('Permissions assignées', assignedPermissions, false)}
      </Grid>

      <Grid item container direction="column" justifyContent="center" alignItems="center" sx={{ width: 'auto' }}>
        <Button
          color="inherit"
          variant="outlined"
          size="small"
          onClick={handleCheckedLeft}
          disabled={rightChecked.length === 0}
          aria-label="move selected left"
          sx={{ my: 1 }}
        >
          <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
        </Button>

        <Button
          color="inherit"
          variant="outlined"
          size="small"
          onClick={handleCheckedRight}
          disabled={leftChecked.length === 0}
          aria-label="move selected right"
          sx={{ my: 1 }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={18} />
        </Button>
      </Grid>

      <Grid item xs={5} sx={{ minWidth: '250px', maxWidth: '300px', overflow: 'auto', height: '300px' }}>
        {customList('Permissions disponibles', availablePermissions, false)}
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={permissionsDialog.onFalse}>Annuler</Button>
    <Button onClick={handleSavePermissions} color="primary">
      Enregistrer
    </Button>
  </DialogActions>
</Dialog>
      {/* Menu pour gérer les rôles */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleManagePermissions}>
          Gérer Permissions
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Êtes-vous sûr de vouloir supprimer <strong> {table.selected.length} </strong> éléments ?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
            }}
          >
            Supprimer
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { username, status, role } = filters; 

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (username) {
    const lowerCaseUsername = username.toLowerCase();
    inputData = inputData.filter((user) => 
      user.username && user.username.toLowerCase().includes(lowerCaseUsername)
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}