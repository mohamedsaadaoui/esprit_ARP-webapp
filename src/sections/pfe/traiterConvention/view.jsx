import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import conventionService from 'src/services/pfe-services/conventionService';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import UserTableRow from '../etudiant-table-row';
import UserTableToolbar from '../etudiant-table-toolbar';

// ----------------------------------------------------------------------

const CONVENTION_STATUS_OPTIONS = [
  { value: 'PAS_DE_CONVENTION', label: 'Pas de convention' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'APPROUVEE', label: 'Approuvé' },
  { value: 'SIGNED', label: 'signée' },
  { value: 'REJETEE', label: 'Rejeté' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'Tous' }, ...CONVENTION_STATUS_OPTIONS];

// Colonnes ajustées selon les données disponibles
const TABLE_HEAD = [
  { id: 'etudiantId', label: 'Identifiant', width: 120 },
  { id: 'nom', label: 'Nom', width: 150 },
  { id: 'prenom', label: 'Prénom', width: 150 },
  { id: 'emailEtudiant', label: 'Email', width: 200 },
  { id: 'telephone', label: 'Téléphone', width: 120 },
  { id: 'status', label: 'etat convention', width: 100 },
  { id: '', width: 40 }, // Colonne actions
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ListConventionView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0,
  });



  useEffect(() => {
  const fetchEtudiants = async () => {
    try {
      setLoading(true);
      const response = await conventionService.getAllEtudiants(
        pagination.page,
        pagination.size,
        filters.name
        // Add other filters as needed
        // filters.promotion,
        // filters.filiere
      );
      setTableData(response.data.content); // Adjust based on your API response structure
      setPagination((prev) => ({
        ...prev,
        total: response.data.totalElements,
      }));

      console.log('Fetched students:', response.data.content);
    } catch (error) {
      console.error('Error fetching students:', error);
      enqueueSnackbar('Error loading students', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  fetchEtudiants();
  }, [enqueueSnackbar, filters.name, pagination.page, pagination.size]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

   // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
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

  const handleUpdateRow = useCallback(
    (updatedRow) => {
      setTableData((prevState) =>
        prevState.map((row) => row.idConvention === updatedRow.idConvention ? updatedRow : row)
      );
      enqueueSnackbar('Mise à jour réussie!');
    },
    [enqueueSnackbar]
  );
  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          // heading="Liste des etudiant"
          links={[
            { name: 'Accueil', href: paths.dashboard.root },
            //  { name: 'Liste des etudiant', href: paths.dashboard.user.root },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => {
              let count;

              switch (tab.value) {
                case 'all':
                  count = tableData.length;
                  break;
                case 'PAS_DE_CONVENTION':
                  count = tableData.filter((etudiant) => !etudiant.statutConvention).length;
                  break;
                case 'EN_ATTENTE':
                  count = tableData.filter((etudiant) => etudiant.statutConvention === 'EN_ATTENTE').length;
                  break;
                case 'APPROUVEE':
                  count = tableData.filter((etudiant) => etudiant.statutConvention === 'APPROUVEE').length;
                  break;
                case 'SIGNED':
                  count = tableData.filter((etudiant) => etudiant.statutConvention === 'SIGNED').length;
                  break;
                case 'REJETEE':
                  count = tableData.filter((etudiant) => etudiant.statutConvention === 'REJETEE').length;
                  break;
                default:
                  count = 0;
              }

              return (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        ((tab.value === 'all' || tab.value === filters.status) && 'filled') ||
                        'soft'
                      }
                      color={
                        (tab.value === 'PAS_DE_CONVENTION' && 'warning') ||
                        (tab.value === 'EN_ATTENTE' && 'info') || // Nouveau cas
                        (tab.value === 'APPROUVEE' && 'success') ||
                        (tab.value === 'SIGNED' && 'default') ||
                        (tab.value === 'REJETEE' && 'error') ||
                        'default'
                      }
                    >
                      {count}
                    </Label>
                  }
                />
              );
            })}
          </Tabs>
          <UserTableToolbar filters={filters} onFilters={handleFilters} data={dataFiltered} />

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
                <TableHeadCustom
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
                  {loading ? (
                    <TableEmptyRows height={denseHeight}>
                      <TableNoData notFound loading />
                    </TableEmptyRows>
                  ) : (
                    <>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <UserTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            onUpdateRow={handleUpdateRow}
                          />
                        ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                      />

                      <TableNoData notFound={notFound} />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={pagination.total}
            page={pagination.page}
            rowsPerPage={pagination.size}
            onPageChange={(event, newPage) => {
              setPagination((prev) => ({ ...prev, page: newPage }));
            }}
            onRowsPerPageChange={(event) => {
              setPagination((prev) => ({
                ...prev,
                size: parseInt(event.target.value, 10),
                page: 0,
              }));
            }}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
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
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;

  console.log('applyFilter - filters', filters);

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (etudiant) =>
        etudiant?.emailEtudiant?.toLowerCase().includes(name.toLowerCase()) ||
        etudiant?.nom?.toLowerCase().includes(name.toLowerCase()) ||
        etudiant?.prenom?.toLowerCase().includes(name.toLowerCase()) ||
        etudiant?.etudiantId?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => {
      switch (status) {
        case 'PAS_DE_CONVENTION':
          return !user.statutConvention; // Pas de convention
        case 'EN_ATTENTE':
          return user.statutConvention === 'EN_ATTENTE'; // En attente
        case 'APPROUVEE':
          return user.statutConvention === 'APPROUVEE'; // Appouvée
        case 'SIGNED':
          return user.statutConvention === 'SIGNED'; // Signée
        case 'REJETEE':
          return user.statutConvention === 'REJETEE'; // Rejetée
        default:
          return true;
      }
    });
  }
  return inputData;
}
