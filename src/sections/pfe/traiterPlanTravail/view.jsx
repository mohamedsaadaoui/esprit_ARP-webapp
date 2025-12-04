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

import planTravailService from 'src/services/pfe-services/planTravailService';

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

import PlanTravailTableRow from '../plan-travail-table-row';
import PlanTravailTableToolbar from '../plan-travail-table-toolbar';

// ----------------------------------------------------------------------

const PLAN_STATUS_OPTIONS = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'APPROUVE', label: 'Approuvé' },
  { value: 'REJETE', label: 'Rejeté' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'Tous' }, ...PLAN_STATUS_OPTIONS];

// Colonnes ajustées pour les plans de travail
const TABLE_HEAD = [
  { id: 'etudiantId', label: 'Identifiant', width: 120 },
  { id: 'nom', label: 'Nom', width: 150 },
  { id: 'prenom', label: 'Prénom', width: 150 },
  { id: 'titre', label: 'Titre du projet', width: 200 },
  { id: 'entreprise', label: 'Entreprise', width: 150 },
  { id: 'status', label: 'Statut du plan', width: 120 },
  { id: '', width: 40 }, // Colonne actions
];

const defaultFilters = {
  name: '',
  status: 'all',
};

// ----------------------------------------------------------------------

export default function PlanTravailListView() {
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
    const fetchPlansTravail = async () => {
      try {
        setLoading(true);
        const response = await planTravailService.getAllPlansTravail(
          pagination.page,
          pagination.size,
          filters.name
        );
        console.log('Fetched plans:', response.content);
        
        setTableData(response.content);
        setPagination((prev) => ({
          ...prev,
          total: response.totalElements,
        }));
        
      } catch (error) {
        console.error('Error fetching work plans:', error);
        enqueueSnackbar('Erreur lors du chargement des plans de travail', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlansTravail();
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


  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Suppression réussie!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar('Suppression réussie!');

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

    const handleViewDetails = useCallback(
    (id) => {
      router.push(paths.dashboard.planTravail.details(id));
    },
    [router]
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
                case 'EN_ATTENTE':
                  count = tableData.filter((plan) => plan.etat === 'EN_ATTENTE').length;
                  break;
                case 'APPROUVE':
                  count = tableData.filter((plan) => plan.etat === 'APPROUVE').length;
                  break;
                case 'REJETE':
                  count = tableData.filter((plan) => plan.etat === 'REJETE').length;
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
                        (tab.value === 'EN_ATTENTE' && 'info') ||
                        (tab.value === 'APPROUVE' && 'success') ||
                        (tab.value === 'REJETE' && 'error') ||
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
          <PlanTravailTableToolbar 
            filters={filters} 
            onFilters={handleFilters} 
            onResetFilters={handleResetFilters}
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
                          <PlanTravailTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                          // onDeleteRow={() => handleDeleteRow(row.id)}
                          // onEditRow={() => handleEditRow(row.id)}
                          // onViewDetails={() => handleViewDetails(row.id)}
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
        title="Supprimer"
        content={
          <>
Êtes-vous sûr de vouloir supprimer <strong> {table.selected.length} </strong> plan(s) de travail ?          </>
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
            Supprimer
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;


  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

   if (name) {
    inputData = inputData.filter(
      (plan) =>
        plan?.etudiant?.email?.toLowerCase().includes(name.toLowerCase()) ||
        plan?.etudiant?.nom?.toLowerCase().includes(name.toLowerCase()) ||
        plan?.etudiant?.prenom?.toLowerCase().includes(name.toLowerCase()) ||
        plan?.etudiant?.id?.toLowerCase().includes(name.toLowerCase()) ||
        plan?.titre?.toLowerCase().includes(name.toLowerCase()) ||
        plan?.entreprise?.nomEntreprise?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((plan) => {
      switch (status) {
        case 'EN_ATTENTE':
          return plan.etat === 'EN_ATTENTE';
        case 'APPROUVE':
          return plan.etat === 'APPROUVE';
        case 'REJETE':
          return plan.etat === 'REJETE';
        default:
          return true;
      }
    });
  }
  return inputData;
}
