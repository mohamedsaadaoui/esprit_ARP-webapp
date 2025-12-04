import { parseISO ,isSameDay } from 'date-fns';
import {useState, useEffect, useCallback } from 'react';

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

import { _orders } from 'src/_mock';
import { useGlobalData } from 'src/globalDataProvider';
import courService from 'src/services/emploi-services/courService';

import Label from 'src/components/label';
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

import OrderTableRow from '../charge-hor-table-row';
import OrderTableToolbar from '../charge-hor-table-toolbar';
import { OrderTableRowSkeleton } from './charge-hor-TableRowSkeleton';
import OrderTableFiltersResult from '../charge-hor-table-filters-result';
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tout' },
  { value: 'Completé', label: 'Completé' },
  { value: 'En cours', label: 'En cours' }
];
const TABLE_HEAD = [
  { id: 'nomPrenom', label: 'Enseignant ' },
  { id: 'nomClasse', label: 'Classe', width: 140 },
  { id: 'designationMatiere', label: 'Module', width: 120 },
  { id: 'nbHeureAdd', label: 'Heures enseignées', width: 110},
  { id: 'status', label: 'Statut', width: 110 , align: 'center'},
  {   },

];

const defaultFilters = {
  name: '',
  nomClasse: [],
  nomPrenom: [],
  designationMatiere:[], 
  status: 'all',
  startDate: null,
  coursDate: null, // Remplacez startDate par coursDate

};

// ----------------------------------------------------------------------

export default function OrderListView() {
  const { enqueueSnackbar } = useSnackbar();

  const { semestreSelectionne, cursusSelectionne } = useGlobalData(); // Récupérez le semestre sélectionné et la liste des semestres

  const [tableData, setTableData] = useState(_orders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Démarrer le chargement
      try {
        console.log("semestre ", semestreSelectionne);
        if (!semestreSelectionne) {
          setTableData([]);
          return;
        }
        if (!cursusSelectionne) {
          setTableData([]);
          enqueueSnackbar('Veuillez sélectionner un cursus', { variant: 'warning' });
          return;
        }
        const data = await courService.getEmployesWithCours(semestreSelectionne, cursusSelectionne);
        console.log('Données API:', data);
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setTableData(data);
          } else {
            setTableData([]);
            enqueueSnackbar('Aucun résultat trouvé', { variant: 'info' });
          }
        } else {
          setTableData([]);
          enqueueSnackbar('Format de données incorrect', { variant: 'error' });
        }
      } catch (err) {
        console.error('Erreur API:', err);
        enqueueSnackbar(`Erreur: ${err.message}`, { variant: 'error' });
        setTableData([]);
      } finally {
        setLoading(false); // Fin du chargement
      }
    };
  
    fetchData();
  }, [semestreSelectionne, cursusSelectionne, enqueueSnackbar]);
  const classesOptions = [...new Set(tableData.map(item => item.nomClasse))].filter(Boolean);
  const teachersOptions = [...new Set(tableData.map(item => item.nomPrenom))].filter(Boolean);
  const modulesOptions = [...new Set(tableData.map(item => item.designationMatiere))].filter(Boolean);

  const table = useTable({ defaultOrderBy: 'orderNumber' });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();


  const [filters, setFilters] = useState(defaultFilters);

  // const dateError = isAfter(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );


  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate );

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

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.order.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            {
              name: 'Dashboard',
       //       href: paths.dashboard.root,
            },
            {
              name: 'Order',
// href: paths.dashboard.order.root,
            },
            { name: 'List' },
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
  {STATUS_OPTIONS.map((tab) => (
    <Tab
      key={tab.value}
      iconPosition="end"
      value={tab.value}
      label={tab.label}
      icon={
        <Label
          variant={
            ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
          }
          color={
            (tab.value === 'Completé' && 'success') ||
            (tab.value === 'En cours' && 'warning') ||
            'default'
          }
        >
          {tab.value === 'all' 
            ? tableData.length
            : tableData.filter(item => 
                tab.value === 'Completé' 
                  ? item.chargeH === item.nbHeureAdd 
                  : item.chargeH !== item.nbHeureAdd
              ).length}
        </Label>
      }
    />
  ))}
</Tabs>
          <OrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            classesOptions={classesOptions}
            teachersOptions={teachersOptions}
            modulesOptions={modulesOptions}
            data={tableData}
            
            //
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

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
  {loading ? (
    [...Array(5)].map((_, index) => <OrderTableRowSkeleton key={index} />) // Affichez les squelettes
  ) : (
    dataFiltered
      .slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
      )
      .map((employe, index) => (
        <OrderTableRow
          key={index} // <-- Utilisation de l'index ici
          row={employe}
          selected={table.selected.includes(employe.idEmploye)}
          onSelectRow={() => table.onSelectRow(employe.idEmploye)}
          onViewRow={() => handleViewRow(employe.idEmploye)}
          onDeleteRow={() => handleDeleteRow(employe.idEmploye)}
          filters={filters} // Passez les filtres ici
        />
      ))
  )}
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
            //
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
  const { status, name, nomClasse, nomPrenom, designationMatiere, coursDate } = filters;

  let filteredData = [...inputData];

  if (status !== 'all') {
    filteredData = filteredData.filter((item) => {
      const isCompleted = item.chargeH === item.nbHeureAdd;
      return status === 'Completé' ? isCompleted : !isCompleted;
    });
  }
  // Filtre par nom
  if (name) {
    const searchTerm = name.toLowerCase();
    filteredData = filteredData.filter((item) =>
      (item.nomPrenom?.toLowerCase().includes(searchTerm) ||
       item.designationMatiere?.toLowerCase().includes(searchTerm)||
       item.nomClasse?.toLowerCase().includes(searchTerm))
    );
  }

  // Filtre par classe
  if (nomClasse.length > 0) {
    filteredData = filteredData.filter((item) => 
      nomClasse.includes(item.nomClasse)
    );
  }

  // Filtre par enseignant
  if (nomPrenom.length > 0) {
    filteredData = filteredData.filter((item) => 
      nomPrenom.includes(item.nomPrenom)
    );
  }

  // Filtre par module
  if (designationMatiere.length > 0) {
    filteredData = filteredData.filter((item) => 
      designationMatiere.includes(item.designationMatiere)
    );
  }

  // Filtre par date de cours
  if (coursDate) {
    const filterDate = new Date(coursDate);
    filteredData = filteredData.filter((item) => 
      item.cours && item.cours.some((coursItem) => 
        coursItem.dateCours && isSameDay(parseISO(coursItem.dateCours), filterDate)
      )
    );
  }

  // Tri des données
  const stabilizedThis = filteredData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}