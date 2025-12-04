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

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { useGlobalData } from 'src/globalDataProvider';
import PermissionBasedGuard from 'src/auth/guard/permession-based-guard';
import annulerCoursService from 'src/services/emploi-services/annulerCoursService';

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

import RattrapageTableRow from './rattrapage-table-row';
import RattrapageTableToolbar from './rattrapage-table-toolbar';

const TABLE_HEAD = [
  { id: 'nomPrenom', label: 'Enseignant', width: 240 },
  { id: 'designation', label: 'Module', width: 160 },
  { id: 'nomClasse', label: 'Classe', width: 160 },
  { id: 'datecours', label: 'Date cour', width: 180 },
  { id: 'codePlageHoraire', label: 'Séance', width: 180 },
  { id: 'motif', label: 'Motif', width: 180 },
  { id: 'etat', label: 'État', width: 180 },
  { id: 'actions', label: '', width: 180 },
];
 
const defaultFilters = {
  search: '',
  status: 'all',
};
const findSemestreById = (semestreSelectionneId, semestres) => 
  semestres.find(semestre => semestre.id === semestreSelectionneId);

export default function RattrapageListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const { semestreSelectionne, semestres } = useGlobalData(); // Get selected semester and semester list
  const semestreCorrespondant = findSemestreById(semestreSelectionne, semestres); // Find corresponding semester
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const { userPermissions } = useAuthContext();

  const fetchData = async () => {
    if (semestreCorrespondant) { 
      try {
        const coursAnnules = await annulerCoursService.getCoursAnnulesBySemestre(semestreCorrespondant.id); 
        setTableData(coursAnnules);
      } catch (error) {
        enqueueSnackbar(`Error fetching canceled courses: ${error.message}`, { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    fetchData(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enqueueSnackbar, semestreCorrespondant]);
 
  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
        ...prevState,
        [name]: value,
    }));
}, []);
 
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });
 
  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );
 
  const notFound = (!dataFiltered.length && !isEqual(defaultFilters, filters)) || !dataFiltered.length;
 
  const handleDeleteRow = useCallback((id) => {
    const deleteRow = tableData.filter((row) => row.idannulation !== id);
    enqueueSnackbar('Delete success!');
    setTableData(deleteRow);
    table.onUpdatePageDeleteRow(dataInPage.length);
  }, [dataInPage.length, enqueueSnackbar, table, tableData]);
 
  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.idannulation));
    enqueueSnackbar('Delete success!');
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);
 
  return (
    <PermissionBasedGuard permissions={['VIEW_COUR_ANNULE']}hasContent>

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Liste des Cours Annulés"
          links={[
            { name: 'Dashboard', href: paths.dashboard },
            { name: 'Cours Annulés' },
          ]}
        />
        <Card>
          <RattrapageTableToolbar
            filters={filters}
            onFilters={handleFilters}
            data={tableData} // Assurez-vous que tableData est bien initialisé

          />
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.idannulation)
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
                      dataFiltered.map((row) => row.idannulation)
                    )
                  }
                />
 
                <TableBody>
                  {dataInPage.map((row) => (
                    <RattrapageTableRow
                      key={row.idannulation}
                      row={row}
                      // eslint-disable-next-line no-undef
                      onEditRow={() => handleEditRow(row.idannulation)}
                      onDeleteRow={() => handleDeleteRow(row.idannulation)}
                      onRestoreRow={fetchData}
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
 
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
             Êtes-vous sûr de vouloir supprimer ce rattrapage ? <strong> {table.selected.length} </strong> items?
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
  const { search, startDate } = filters; // Mettez à jour pour utiliser 'search'

  // Tri initial
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  // Filtre sur le texte (recherche)
  if (search) {
    inputData = inputData.filter(item =>
        item.cours.modules.some(module =>
            module?.designation?.toLowerCase().includes(search.toLowerCase()) // Vérifiez si module existe
        ) ||
        item.cours.employes[0]?.nom?.toLowerCase().includes(search.toLowerCase()) || // Vérifiez si nom existe
        item.cours.employes[0]?.prenom?.toLowerCase().includes(search.toLowerCase()) // Vérifiez si prénom existe
    );
}

  // Filtre sur la date du cours (si nécessaire)
  if (startDate) {
      const filterDate = new Date(startDate);
      inputData = inputData.filter(row => {
          const rowDate = new Date(row.cours.datecours);
          return rowDate.getFullYear() === filterDate.getFullYear() &&
                 rowDate.getMonth() === filterDate.getMonth() &&
                 rowDate.getDate() === filterDate.getDate();
      });
  }

  return inputData;
}