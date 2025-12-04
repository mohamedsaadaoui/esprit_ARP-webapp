import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

 import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { Dialog, Select, MenuItem, TextField, InputLabel, DialogTitle, FormControl, DialogActions, DialogContent } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { useGlobalData } from 'src/globalDataProvider';
import salleService from 'src/services/emploi-services/salleService';
import cursusService from 'src/services/emploi-services/cursusService';
import PermissionBasedGuard from 'src/auth/guard/permession-based-guard';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TableHeadCustomSalle from 'src/components/table/table-head-customSalle';
import {
  useTable,
  TableNoData,
  getComparator,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import SalleTableRow from './salle-table-row';
import SalleTableToolbar from './salle-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nom', label: 'Nom salle', width: 180 },
  { id: 'capacite', label: 'Capacité', width: 220 },
  { id: 'typeSalle', label: 'Type Salle', width: 180 },
  { id: 'localisation', label: 'Localisation', width: 180 },
  { id: 'statut', label: 'Statut', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters = {
  id: '',
  nom: '',
  capacite: '',
  typeSalle: '',
  localisation: '',
  statut: 'all',
};

// ----------------------------------------------------------------------

export default function SalleListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { userPermissions } = useAuthContext();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSalle, setNewSalle] = useState({
    id: '',
    nom: '',
    typesalle: '',
    capacite: '',
    localisation: '',
    statut: true,
  });
  const [cursusList, setCursusList] = useState([]);
  const [selectedCursus, setSelectedCursus] = useState([]);
  const { cursusSelectionne } = useGlobalData();

  useEffect(() => {
    console.log('Cursus Selectionné:', cursusSelectionne);

    const fetchSalles = async () => {
      if (cursusSelectionne) {
        try {
          const salles = await salleService.getSallesByCursusId(cursusSelectionne);
          setTableData(salles);
        } catch (error) {
          console.error('Erreur lors de la récupération des salles:', error);
        }
      } else {
        console.warn(`Cursus ID is undefined or cursusSelectionne is not set.${  cursusSelectionne}`);
      }
    };

    fetchSalles();
  }, [cursusSelectionne]);

  useEffect(() => {
    const fetchCursus = async () => {
      try {
        const cursusData = await cursusService.getAllCursus();
        setCursusList(cursusData);
      } catch (error) {
        console.error('Erreur lors de la récupération des cursus:', error);
      }
    };

    fetchCursus();
  }, [enqueueSnackbar]);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const canReset = !isEqual(defaultFilters, filters);
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSalle((prev) => ({
      ...prev,
      [name]: name === 'statut' ? e.target.checked : value,
    }));
  };

  const handleCursusChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedCursus(typeof value === 'string' ? value.split(',') : value);
  };

  const handleAddSalle = async () => {
    try {
        const salleToAdd = {
            ...newSalle,
            // eslint-disable-next-line object-shorthand
            cursus: selectedCursus.map((id) => ({ id: id })), // Utilisez 'id' ici
        };
        const addedSalle = await salleService.addSalle(salleToAdd);
        setTableData((prev) => [...prev, addedSalle]);
        setNewSalle({ nom: '', typesalle: '', capacite: '', localisation: '', statut: false });
        setSelectedCursus([]);
        handleCloseDialog();
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la salle:', error);
    }
};

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      enqueueSnackbar('Delete success!');
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    enqueueSnackbar('Delete success!');
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  return (
    <PermissionBasedGuard permissions={['VIEW_SALLE']} hasContent>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liste des salles"
          links={[
            { name: 'Dashboard', href: paths.dashboard },
            { name: 'Salle' },
          ]}
          action={
            userPermissions.includes('CREATE_SALLE') && (
              <Button
                component={RouterLink}
                href={paths.dashboard.five}
                variant="contained"
                onClick={handleOpenDialog}
                startIcon={<Iconify icon="ic:baseline-add" />}
              >
                Ajouter une Salle
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <SalleTableToolbar
            filters={filters}
            onFilters={handleFilters}
            data={dataFiltered}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustomSalle
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
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
                      <SalleTableRow
                        key={row.id}
                        row={{
                          ...row,
                          id: `${row.id} `,
                        }}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => userPermissions.includes('DELETE_SALLE') && handleDeleteRow(row.id)}
                        onEditRow={() => userPermissions.includes('UPDATE_SALLE') && handleEditRow(row.id)}
                        userPermissions={userPermissions}
                      />
                    ))}
                  <TableNoData notFound={notFound} />
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
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Ajouter une nouvelle salle</DialogTitle>
        <DialogContent>
          <TextField
            name="nom"
            label="Nom"
            value={newSalle.nom}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="typesalle-label">Type de Salle</InputLabel>
            <Select
              labelId="typesalle-label"
              name="typesalle"
              value={newSalle.typesalle}
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
            value={newSalle.capacite}
            onChange={handleChange}
            type="number"
            fullWidth
            margin="normal"
          />
          <TextField
            name="localisation"
            label="Localisation"
            value={newSalle.localisation}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="cursus-label">Cursus</InputLabel>
            <Select
              labelId="cursus-label"
              multiple
              value={selectedCursus}
              onChange={handleCursusChange}
            >
              {cursusList.map((cursus) => (
                <MenuItem key={cursus.id} value={cursus.id}>
                  {cursus.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ backgroundColor: 'lightgray', color: 'black' }}>
            Annuler
          </Button>
          <Button onClick={handleAddSalle} sx={{ backgroundColor: 'lightgray', color: 'black' }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong>{table.selected.length}</strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </PermissionBasedGuard>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name} = filters;
 
  const stabilizedThis = inputData.map((el, index) => [el, index]);
 
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
 
  inputData = stabilizedThis.map((el) => el[0]);
 
  if (name) {
    inputData = inputData.filter(user =>
      user.nom?.toLowerCase().includes(name.toLowerCase()) ||
      user.localisation?.toLowerCase().includes(name.toLowerCase()) ||
      user.typesalle?.toLowerCase().includes(name.toLowerCase()) ||
      (user.capacite !== undefined && user.capacite.toString().toLowerCase().includes(name.toLowerCase()))
    );
  }
 
 
 
 
 
 
 
 
  return inputData;
}