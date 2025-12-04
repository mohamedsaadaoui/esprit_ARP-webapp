import React from "react";
import PropTypes from "prop-types";

import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalculateIcon from "@mui/icons-material/Calculate";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  Box,
  Chip,
  Table,
  Paper,
  alpha,
  Tooltip,
  Divider,
  TableRow,
  useTheme,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from "@mui/material";

const ResultsDetails = ({ results }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  if (!Array.isArray(results) || results.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
        Aucun résultat disponible.
      </Typography>
    );
  }

  // Group results by uniteName
  const groupedResults = results.reduce((acc, result) => {
    (acc[result.uniteName] = acc[result.uniteName] || []).push(result);
    return acc;
  }, {});

  // Function to determine grade color based on score
  const getGradeColor = (score) => {
    if (score >= 16) return theme.palette.success.dark;
    if (score >= 14) return theme.palette.success.main;
    if (score >= 12) return theme.palette.success.light;
    if (score >= 10) return theme.palette.info.main;
    if (score >= 8) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Function to get grade label
  const getGradeLabel = (score) => {
    if (score >= 16) return "Excellent";
    if (score >= 14) return "Très Bien";
    if (score >= 12) return "Bien";
    if (score >= 10) return "Passable";
    if (score >= 8) return "Insuffisant";
    return "Faible";
  };

  return (
    <Box sx={{ borderRadius: 2, overflow: "hidden", boxShadow: theme.shadows[3] }}>
      <TableContainer component={Paper} sx={{ width: "100%", borderRadius: 0 }}>
        <Table sx={{ width: "100%" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(primaryColor, 0.05) }}>
              <TableCell sx={{ color: "text.primary", fontWeight: "bold", borderBottom: `2px solid ${primaryColor}`, py: 2 }} width="40%">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MenuBookIcon sx={{ mr: 1, color: primaryColor }} />
                  Module
                </Box>
              </TableCell>
              <TableCell sx={{ color: "text.primary", fontWeight: "bold", borderBottom: `2px solid ${primaryColor}`, py: 2 }} width="20%">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EmojiEventsIcon sx={{ mr: 1, color: primaryColor }} />
                  Moyenne Module
                </Box>
              </TableCell>
              <TableCell sx={{ color: "text.primary", fontWeight: "bold", borderBottom: `2px solid ${primaryColor}`, py: 2 }} width="15%">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalculateIcon sx={{ mr: 1, color: primaryColor }} />
                  Coef
                </Box>
              </TableCell>
              <TableCell sx={{ color: "text.primary", fontWeight: "bold", borderBottom: `2px solid ${primaryColor}`, py: 2 }} width="15%">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <StarIcon sx={{ mr: 1, color: primaryColor }} />
                  Moyenne Unite
                </Box>
              </TableCell>
              <TableCell sx={{ color: "text.primary", fontWeight: "bold", borderBottom: `2px solid ${primaryColor}`, py: 2 }} width="10%">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SchoolIcon sx={{ mr: 1, color: primaryColor }} />
                  ECTS
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groupedResults).map(([uniteName, modules], unitIndex) => (
              <React.Fragment key={uniteName}>
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 2, bgcolor: primaryColor, color: "white", borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.2)}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
                        <SchoolIcon sx={{ mr: 1 }} />
                        {uniteName}
                      </Typography>
                      <Chip label={`${modules.length} module${modules.length > 1 ? "s" : ""}`} size="small" sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), color: "white", fontWeight: "medium" }} />
                    </Box>
                  </TableCell>
                </TableRow>
                {modules.map((module, index) => {
                  const gradeColor = getGradeColor(module.moyenneModule);
                  const gradeLabel = getGradeLabel(module.moyenneModule);
                  const isLastModule = index === modules.length - 1;
                  const isLastUnit = unitIndex === Object.keys(groupedResults).length - 1;

                  return (
                    <TableRow
                      key={module.idAnnee}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                        borderBottom: isLastModule && !isLastUnit ? `2px dashed ${alpha(primaryColor, 0.2)}` : "none",
                      }}
                    >
                      <TableCell sx={{ py: 2, borderBottom: isLastModule && isLastUnit ? "none" : `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Typography variant="body2" fontWeight="medium">
                          {module.moduleName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2, borderBottom: isLastModule && isLastUnit ? "none" : `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Tooltip title={gradeLabel} arrow placement="top">
                          <Chip
                            label={module.moyenneModule.toFixed(2)}
                            size="small"
                            sx={{
                              fontWeight: "bold",
                              bgcolor: alpha(gradeColor, 0.1),
                              color: gradeColor,
                              border: `1px solid ${alpha(gradeColor, 0.3)}`,
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ py: 2, borderBottom: isLastModule && isLastUnit ? "none" : `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Typography variant="body2">{module.coef.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2, borderBottom: isLastModule && isLastUnit ? "none" : `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Typography variant="body2" fontWeight="medium">
                          {module.moyenneUnite.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2, borderBottom: isLastModule && isLastUnit ? "none" : `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Chip
                          label={module.uniteEcts.toFixed(0)}
                          size="small"
                          variant="outlined"
                          sx={{ minWidth: 32, fontWeight: "medium" }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!Object.keys(groupedResults).length - 1 === unitIndex && <Divider />}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

ResultsDetails.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      uniteName: PropTypes.string.isRequired,
      moduleName: PropTypes.string.isRequired,
      moyenneModule: PropTypes.number.isRequired,
      coef: PropTypes.number.isRequired,
      moyenneUnite: PropTypes.number.isRequired,
      uniteEcts: PropTypes.number.isRequired,
      idAnnee: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// Remove defaultProps

export default ResultsDetails;