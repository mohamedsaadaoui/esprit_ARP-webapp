"use client"

import moment from "moment"
import { useState, useEffect } from "react"

import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import Fade from "@mui/material/Fade"
import Grid from "@mui/material/Grid"
import Alert from "@mui/material/Alert"
import Stack from "@mui/material/Stack"
import Avatar from "@mui/material/Avatar"
import { Typography } from "@mui/material"
import Container from "@mui/material/Container"
import { alpha, useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import EventNoteIcon from "@mui/icons-material/EventNote"
import AssessmentIcon from "@mui/icons-material/Assessment"
import CircularProgress from "@mui/material/CircularProgress"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import ScheduleIcon from "@mui/icons-material/Schedule"
import PermissionBasedGuard from "src/auth/guard/permession-based-guard"

import { useAuthContext } from "src/auth/hooks"
import absenceService from "src/services/online-services/absenceService"

import AbsenceTable from "src/components/absence-table"
import AbsenceMonitor from "src/components/absence-monitor"
import { useSettingsContext } from "src/components/settings"

// ----------------------------------------------------------------------

export default function AbsenceView() {
  const theme = useTheme()
  const settings = useSettingsContext()
  const { user } = useAuthContext()
  const etudiantId = user?.sub
  const [loading, setLoading] = useState(true)
  const [absenceData, setAbsenceData] = useState([])
  const [statistics, setStatistics] = useState({
    totalAbsences: 0,
    justifiedAbsences: 0,
    unjustifiedAbsences: 0,
    missedHours: 0,
  })

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const primaryColor = theme.palette.primary.main

  // Calculate statistics from absence data
  const calculateStatistics = (data) => {
    if (!data || data.length === 0) {
      return {
        totalAbsences: 0,
        justifiedAbsences: 0,
        unjustifiedAbsences: 0,
        missedHours: 0,
      }
    }

    const totalAbsences = data.length
    const justifiedAbsences = data.filter((absence) => absence.estJustifie).length
    const unjustifiedAbsences = totalAbsences - justifiedAbsences

    // Calculate missed hours
    const missedHours = data.reduce((total, absence) => {
      if (absence.heureDebut && absence.heureFin) {
        const startTime = moment(absence.heureDebut, "HH:mm")
        const endTime = moment(absence.heureFin, "HH:mm")
        const duration = moment.duration(endTime.diff(startTime))
        return total + duration.asHours()
      }
      return total
    }, 0)

    return {
      totalAbsences,
      justifiedAbsences,
      unjustifiedAbsences,
      missedHours: Math.round(missedHours * 10) / 10, // Round to 1 decimal place
    }
  }

  // Fetch absence data
  useEffect(() => {
    const fetchAbsenceData = async () => {
      if (!etudiantId) return

      try {
        setLoading(true)
        const startDate = moment().subtract(12, "months").format("YYYY-MM-DD")
        const endDate = moment().format("YYYY-MM-DD")

        const { response } = await absenceService.getEtudiantData(etudiantId, startDate, endDate)
        const data = response.data || []

        setAbsenceData(data)
        setStatistics(calculateStatistics(data))
      } catch (error) {
        console.error("Error fetching absence data:", error)
        setAbsenceData([])
        setStatistics(calculateStatistics([]))
      } finally {
        setLoading(false)
      }
    }

    fetchAbsenceData()
  }, [etudiantId])

  // Handle data updates from child components
  const handleDataUpdate = (newData) => {
    setAbsenceData(newData)
    setStatistics(calculateStatistics(newData))
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={48} thickness={3} />
        <Typography variant="body1" color="text.secondary">
          Chargement des données d&apos;absence...
        </Typography>
      </Box>
    )
  }

  const statisticsData = [
    {
      title: "Total des absences",
      value: statistics.totalAbsences.toString(),
      color: theme.palette.primary.main,
      icon: <TrendingUpIcon />,
    },
    {
      title: "Absences justifiées",
      value: statistics.justifiedAbsences.toString(),
      color: theme.palette.success.main,
      icon: <CheckCircleIcon />,
    },
    {
      title: "Absences non justifiées",
      value: statistics.unjustifiedAbsences.toString(),
      color: theme.palette.warning.main,
      icon: <WarningIcon />,
    },
    {
      title: "Heures manquées",
      value: `${statistics.missedHours}h`,
      color: theme.palette.error.main,
      icon: <ScheduleIcon />,
    },
  ]

  return (
    <PermissionBasedGuard permissions={["ACCESS_ORIENTATION"]} hasContent>
      <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 3 }}>
        <Fade in timeout={500}>
          <Box>


            {/* Statistics Grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {statisticsData.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: stat.color,
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: alpha(stat.color, 0.1),
                          color: stat.color,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Status Alert */}
            {statistics.unjustifiedAbsences > 0 && (
              <Alert
                severity="warning"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Action requise
                </Typography>
                <Typography variant="body2">
                  Vous avez {statistics.unjustifiedAbsences} absence(s) non justifiée(s) qui nécessitent une
                  justification.
                </Typography>
              </Alert>
            )}

            {/* Absence Table Section */}
            <Card sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
     
              <Box sx={{ p: 3 }}>
                <AbsenceTable etudiantId={etudiantId} onDataUpdate={handleDataUpdate} />
              </Box>
            </Card>

            {/* Absence Monitor Section */}
            <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: alpha(primaryColor, 0.1),
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarMonthIcon sx={{ color: primaryColor }} />
                  <Typography variant="h6" fontWeight="bold" color={primaryColor}>
                    Moniteur d&apos;absence
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 3 }} id="absence-monitor">
                <AbsenceMonitor etudiantId={etudiantId} absenceData={absenceData} />
              </Box>
            </Card>
          </Box>
        </Fade>
      </Container>
    </PermissionBasedGuard>
  )
}
