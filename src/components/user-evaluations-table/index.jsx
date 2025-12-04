import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Rating from '@mui/material/Rating';
import {
  Box,
  Chip,
  Table,
  Paper,
  TableRow,
  useTheme,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import evaluationService from 'src/services/online-services/evaluationService';

// 1. Accept `refreshTrigger` prop and remove unused `onEvaluationsUpdated`
const UserEvaluations = ({ studentId, refreshTrigger }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchEvaluations = async () => {
      // Don't show loader on subsequent refreshes, only on the initial load
      if (evaluations.length === 0) {
        setLoading(true);
      }
      try {
        const { response } = await evaluationService.getEvaluationByEtudiant(studentId);
        setEvaluations(response.data);
      } catch (error) {
        console.error('Error fetching evaluations:', error);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) {
      fetchEvaluations();
    }
    // 2. Add `refreshTrigger` to the dependency array.
    // The effect will now run on initial load and whenever refreshTrigger changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, refreshTrigger]);

  const evaluationTypeMapping = {
    EVALUATION_ENSEIGNANT: { label: 'Evaluation Enseignant', color: 'secondary', icon: '👨‍🏫' },
    EVALUATION_MODULE: { label: 'Evaluation Module', color: 'primary', icon: '📚' },
    EVALUATION_STAGES: { label: 'Evaluation Stages', color: 'info', icon: '🏢' },
    EVALUATION_GENERALE: { label: 'Evaluation Générale', color: 'default', icon: '📋' },
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const getEvaluationSubject = (evaluation) => {
    if (evaluation.typeEvaluation === 'EVALUATION_MODULE' && evaluation.moduleDesignation) {
      return (
        <Typography variant="body2" fontWeight="bold">
          {evaluation.moduleDesignation}
        </Typography>
      );
    }
    if (evaluation.typeEvaluation === 'EVALUATION_ENSEIGNANT' && evaluation.employeFullName) {
      return (
        <Typography variant="body2" fontWeight="bold">
          {evaluation.employeFullName}
        </Typography>
      );
    }
    return 'Non spécifié';
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        backgroundColor: theme.palette.info,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
          Evaluations de l&apos;Étudiant
        </Typography>
      </Box>

      {evaluations.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aucune évaluation disponible pour cet étudiant.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  Sujet Évalué
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((evaluation) => (
                  <TableRow
                    key={evaluation.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ width: '10%' }}>{evaluation.id}</TableCell>
                    <TableCell sx={{ width: '25%' }}>
                      <Chip
                        label={`${
                          evaluationTypeMapping[evaluation.typeEvaluation]?.icon || '❓'
                        } ${
                          evaluationTypeMapping[evaluation.typeEvaluation]?.label || 'Non spécifié'
                        }`}
                        color={evaluationTypeMapping[evaluation.typeEvaluation]?.color || 'default'}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '30%' }}>{getEvaluationSubject(evaluation)}</TableCell>
                    <TableCell sx={{ width: '20%' }}>{formatDate(evaluation.dateCreation)}</TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          name={`score-${evaluation.id}`}
                          value={evaluation.score}
                          max={5}
                          readOnly
                          size="small"
                          sx={{ color: theme.palette.primary.main }}
                        />
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({evaluation.score}/5)
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={evaluations.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: '1px solid #e0e0e0',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            margin: 0,
          },
        }}
      />
    </Paper>
  );
};

// 3. Update PropTypes to include the new prop
UserEvaluations.propTypes = {
  studentId: PropTypes.string.isRequired,
  refreshTrigger: PropTypes.number,
};

// Add a default value for the prop
UserEvaluations.defaultProps = {
    refreshTrigger: 0,
};


export default UserEvaluations;