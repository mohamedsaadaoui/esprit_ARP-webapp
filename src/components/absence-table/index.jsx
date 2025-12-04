import moment from 'moment';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import InfoIcon from '@mui/icons-material/Info';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, styled, useTheme } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import absenceService from 'src/services/online-services/absenceService';

import JustificationDetails from '../justification-details';
import JustificationModal from '../add-justification-modal';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.action.hover, 0.6),
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.lighter, 0.1),
  }
}));

const JustifiedCell = styled(StyledTableCell)(({ theme }) => ({
  color: theme.palette.success.main,
  cursor: 'pointer',
  fontWeight: 'medium',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

const UnjustifiedCell = styled(StyledTableCell)(({ theme }) => ({
  color: theme.palette.error.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

// AbsenceTable Component
const AbsenceTable = ({ etudiantId }) => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [startDate, setStartDate] = useState(moment().subtract(12, 'months').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [openDialog, setOpenDialog] = useState(false);
  const [openJustificationModal, setOpenJustificationModal] = useState(false);
  const [selectedJustification, setSelectedJustification] = useState(null);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Change this value to set default rows per page

  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate) return;
      try {
        setLoading(true);
        const { response } = await absenceService.getEtudiantData(etudiantId, startDate, endDate);
        setRows(response.data.length > 0 ? response.data : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching absence data:", error);
        setRows([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [etudiantId, startDate, endDate]);

  const handleJustificationClick = (justification) => {
    setSelectedJustification(justification);
    setOpenDialog(true);
  };

  const handleOpenJustificationModal = (absenceId) => {
    setSelectedAbsenceId(absenceId);
    setOpenJustificationModal(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedJustification(null);
  };

  const handleCloseJustificationModal = () => {
    setOpenJustificationModal(false);
    setSelectedAbsenceId(null);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Slice the rows for pagination
  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card 
      sx={{ 
        mb: 5, 
        overflow: 'visible',
        boxShadow: theme.shadows[10],
        borderRadius: 2,
        position: 'relative',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '5px',
          backgroundColor: theme.palette.primary.main,
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h5" 
          align='center'
          sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            color: theme.palette.primary.main
          }}
        >
          <AssignmentIcon sx={{ mr: 1 }} /> Registres d`&lsquo;absence
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 3,
          p: 2,
          bgcolor: alpha(theme.palette.background.default, 0.5),
          borderRadius: 1
        }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ 
              mr: 2, 
              width: '200px',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.light,
                },
              },
            }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ 
              width: '200px',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.light,
                },
              },
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Fade in timeout={500}>
            <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[3] }}>
              <Table sx={{ minWidth: 700 }} aria-label="absence table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Module</StyledTableCell>
                    <StyledTableCell align="right">Date</StyledTableCell>
                    <StyledTableCell align="right">Start Time</StyledTableCell>
                    <StyledTableCell align="right">End Time</StyledTableCell>
                    <StyledTableCell align="right">Instructor</StyledTableCell>
                    <StyledTableCell align="right">Justified</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.length === 0 ? (
                    <StyledTableRow>
                      <StyledTableCell colSpan={7} align="center">
                      Aucun enregistrement trouvé. Veuillez ajuster la plage de dates pour afficher vos absences.
                      </StyledTableCell>
                    </StyledTableRow>
                  ) : (
                    paginatedRows.map((row, index) => (
                      <StyledTableRow key={`${row.etudiantId}-${row.dateCours}-${index}`}>
                        <StyledTableCell component="th" scope="row">{row.designation}</StyledTableCell>
                        <StyledTableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                            {row.dateCours}
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                            {row.heureDebut}
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell align="right">{row.heureFin}</StyledTableCell>
                        <StyledTableCell align="right">{row.enseignant}</StyledTableCell>
                        {row.estJustifie ? (
                          <JustifiedCell align="right" onClick={() => handleJustificationClick(row.justification)}>
                            <Tooltip title="View justification details">
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                                Yes
                                <InfoIcon fontSize="small" sx={{ ml: 0.5 }} />
                              </Box>
                            </Tooltip>
                          </JustifiedCell>
                        ) : (
                          <UnjustifiedCell align="right">
                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                              No
                              <Button 
                                onClick={() => handleOpenJustificationModal(row.absenceId)} 
                                variant="outlined" 
                                size="small" 
                                sx={{ 
                                  ml: 1,
                                  borderColor: theme.palette.primary.light,
                                  color: theme.palette.primary.main,
                                  '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                  }
                                }}
                              >
                                Add Justification
                              </Button>
                            </Box>
                          </UnjustifiedCell>
                        )}
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        )}

        {/* Pagination Component */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
      
      {/* Dialog for Justification Details */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), fontWeight: 'bold' }}>
          Justification Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedJustification && <JustificationDetails justification={selectedJustification} />}
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained"
            sx={{ 
              px: 3,
              borderRadius: '8px',
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[5],
              }
            }}
          >
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Justification Modal */}
      <JustificationModal 
        open={openJustificationModal} 
        onClose={handleCloseJustificationModal} 
        absenceId={selectedAbsenceId}
      />
    </Card>
  );
};

AbsenceTable.propTypes = {
  etudiantId: PropTypes.string.isRequired,
};

export default AbsenceTable;