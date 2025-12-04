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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGlobalData } from 'src/globalDataProvider';
import PermissionBasedGuard from 'src/auth/guard/permession-based-guard';
import planningService from 'src/services/emploi-services/planningService';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TableHeadCustomPlanning from 'src/components/table/table-head-customPlanning';
import {
  useTable,
  TableNoData,
  getComparator,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import PlanTableRow from './plan-table-row';
import PlanTableToolbar from './plan-table-toolbar';

const TABLE_HEAD = [
  { id: 'nomClasse', label: 'Classe' },
  { id: 'codeModule', label: 'Code Module', width: 180 },
  { id: 'designation', label: 'Designation', width: 180 },
  { id: 'chargeH', label: 'Charge horaire', width: 220 },
  { id: 'nomCompletEmploye', label: 'Enseignant', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters = {
  nomClasse: [],
  search: '',  // Remplacez codeModule par search
  chargeH: '',
  nomCompletEmploye: [],
};
export default function PlanListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const {
    anneeSelectionne,
  } = useGlobalData();
  const { semestreSelectionne, cursusSelectionne } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plannings = await planningService.getPlanningBySemestreAndCursus(semestreSelectionne,cursusSelectionne);
        
        // Vérifier si plannings est défini et est un tableau
        if (Array.isArray(plannings)) {
          setTableData(plannings);
        } else {
          // Si la réponse n'est pas un tableau, initialiser avec un tableau vide
          setTableData([]);
          enqueueSnackbar('Aucun planning trouvé pour cette semestre', { variant: 'info' });
        }
      } catch (error) {
        enqueueSnackbar(`Erreur lors de la récupération des plannings: ${error.message}`, { variant: 'error' });
        setTableData([]); // Assurez-vous que tableData est toujours un tableau
      }
    };
  
    // Ne faire la requête que si une année est sélectionnée
    if (semestreSelectionne) {
      fetchData();
    } else {
      setTableData([]); // Réinitialiser si aucune année n'est sélectionnée
    }
  }, [semestreSelectionne,cursusSelectionne, enqueueSnackbar]);
  const handleFilters = useCallback(
    (name, value) => {
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    []
  );


  
  const dataFiltered = applyFilter({
    inputData: Array.isArray(tableData) ? tableData : [],
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

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

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );
  // useEffect(() => {
  //   console.log('Données des enseignants:', tableData.map(item => item.nomCompletEmploye));
  // }, [tableData]);
  // Get unique classes and teachers for filter options
  const classesOptions = [...new Set(tableData.map(item => item.nomClasse))].filter(Boolean);
 // Dans PlanListView.js
const teachersOptions = [...new Set(
  tableData.flatMap(plan => 
    plan.employes?.map(emp => emp.nomCompletEmploye) || []
  )
)].filter(Boolean);
  return (
    <PermissionBasedGuard permissions={['VIEW_PLANNING']} hasContent>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liste des plannings"
          links={[
            { name: 'Dashboard', href: paths.dashboard },
            { name: 'Planning' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <PlanTableToolbar
            filters={filters}
            onFilters={handleFilters}
            data={dataFiltered}
            classesOptions={classesOptions}
            teachersOptions={teachersOptions}
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
                <TableHeadCustomPlanning
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
                      <PlanTableRow
                        key={row.id}
                        row={{
                          ...row,
                          idClasse: `${row.id}`,
                        }}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
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
    </PermissionBasedGuard>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { nomClasse, nomCompletEmploye, search } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  // Filtre de recherche globale
  if (search) {
    const searchLower = search.toLowerCase();
    inputData = inputData.filter((plan) =>
      plan.codeModule.toLowerCase().includes(searchLower) ||
      plan.designation.toLowerCase().includes(searchLower)
    );
  }


  // Filtres spécifiques
  if (nomClasse.length > 0) {
    inputData = inputData.filter((plan) =>
      nomClasse.includes(plan.nomClasse)
    );
  }

  if (nomCompletEmploye.length > 0) {
    inputData = inputData.filter((plan) =>
      plan.employes?.some(emp => 
        nomCompletEmploye.includes(emp.nomCompletEmploye)
      )
    );
  }

  return inputData;
}