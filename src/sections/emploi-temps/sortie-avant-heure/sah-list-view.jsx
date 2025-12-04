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

import { useAuthContext } from 'src/auth/hooks';
import { useGlobalData } from 'src/globalDataProvider';
import sahService from 'src/services/emploi-services/sahService';
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

import RetardTableRow from './sah-table-row';
import RetardableToolbar from './sah-table-toolbar';

// ----------------------------------------------------------------------


const TABLE_HEAD = [
  { id: 'nomCompletEmploye', label: 'Enseignant', width:180 },
  { id: 'cours', label: 'Cours' },
  { id: 'cours', label: 'Classe' },
  { id: 'dateCours', label: 'Date cours' },
  { id: 'sceance', label: 'Séance' },
  { id: 'dureeSortie', label: 'Duree de sortie ', width :180 },
  { id: '', width: 88 },
  




];

const defaultFilters = {
 
  nomCompletEmploye: '',
  cours: '',
  dureeSortie: '',
  
};
// Function to find semester by ID
const findSemestreById = (semestreSelectionneId, semestres) => 
  semestres.find(semestre => semestre.id === semestreSelectionneId);
// ----------------------------------------------------------------------

export default function SahListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { semestreSelectionne, semestres } = useGlobalData(); // Get selected semester and semester list
  const semestreCorrespondant = findSemestreById(semestreSelectionne, semestres); // Find corresponding semester
  const [tableData, setTableData] = useState([]); 
  const [filters, setFilters] = useState(defaultFilters);
  const { userPermissions } = useAuthContext();

  const fetchData = async () => {
    if (semestreCorrespondant) { // Check if corresponding semester exists
      try {
        const retards = await sahService.getSortiesAvantHeureBySemestre(semestreCorrespondant.id); // Fetch data by semester ID
        setTableData(retards);
      } catch (error) {
        enqueueSnackbar(`Error fetching sorties: ${error.message}`, { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data when component mounts or semester changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar, semestreCorrespondant]);
  const handleFilters = useCallback(
    (name, value) => {
      console.log('Filtre mis à jour:', name, value);  // Débogue ici
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
  

  // const handleFilters = useCallback(
  //   (name, value) => {
  //     table.onResetPage();
  //     setFilters((prevState) => ({
  //       ...prevState,
  //       [name]: value,
  //     }));
  //   },
  //   [table]
  // );

 
  
  
  

 

  

  // const handleResetFilters = useCallback(() => {
  //   setFilters(defaultFilters);
  // }, []);

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

  // const handleFilterStatus = useCallback(
  //   (event, newValue) => {
  //     handleFilters('status', newValue);
  //   },
  //   [handleFilters]
  // );

  return (
    <PermissionBasedGuard permissions={['VIEW_SORTIE']}hasContent>

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liste des sorties avant heure"
          links={[
            { name: 'Dashboard', href: paths.dashboard },
            { name: 'SAH', href: paths.dashboard.eight },
          ]}
         
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
       
          <RetardableToolbar
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 860 }}>
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
                  {dataInPage.map((row) => (
                    <RetardTableRow
                      key={row.id}
                      row={{
                        ...row,
                        idClasse: `${row.id} `,
                      }}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      refreshedList={fetchData}
                      userPermissions={userPermissions}
                    />
                  ))}

<TableNoData notFound={notFound}  />

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

// ----------------------------------------------------------------------



function applyFilter({ inputData, comparator, filters }) {
  const { name, startDate } = filters;
 
  const stabilizedThis = inputData.map((el, index) => [el, index]);
 
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
 
  inputData = stabilizedThis.map((el) => el[0]);
 
  if (name) {
    inputData = inputData.filter(user =>
      user.idcours.modules.some(module =>
        module.designation.toLowerCase().includes(name.toLowerCase())
      ) ||
      user.idEmploye.prenom.toLowerCase().includes(name.toLowerCase()) ||
      user.idEmploye.nom.toLowerCase().includes(name.toLowerCase())
    );
  }
  if (startDate) {
    const filterDate = new Date(startDate);
    inputData = inputData.filter(row => {
      // On suppose que row.idcours.datecours est une chaîne de caractères (ex: "2023-03-10")
      const rowDate = new Date(row.idcours.datecours);
      return rowDate.getFullYear() === filterDate.getFullYear() &&
             rowDate.getMonth() === filterDate.getMonth() &&
             rowDate.getDate() === filterDate.getDate();
    });
  }

  

  return inputData;
}