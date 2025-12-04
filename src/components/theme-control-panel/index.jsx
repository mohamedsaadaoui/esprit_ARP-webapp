
import { useState } from "react"

import { alpha } from "@mui/material/styles"
import {
  Box,
  Fade,
  Paper,
  Stack,
  Divider,
  useTheme,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material"
import {
  Circle as CircleIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  ViewQuilt as ViewQuiltIcon,
  ColorLens as ColorLensIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material"

import { useSettingsContext } from "src/components/settings"
import BaseOptions from "src/components/settings/drawer/base-option"
import LayoutOptions from "src/components/settings/drawer/layout-options"
import PresetsOptions from "src/components/settings/drawer/presets-options"

function SettingsAccordion() {
  const settings = useSettingsContext()
  const theme = useTheme()
  const [expanded, setExpanded] = useState(false) // Default closed

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const getCurrentValue = (key) => {
    if (key === "mode") return settings.themeMode
    if (key === "layout") return settings.themeLayout
    return settings.themeColorPresets
  }

  const sections = [
    {
      key: "mode",
      icon: <PaletteIcon sx={{ fontSize: 18 }} />,
      title: "Theme Mode",
      description: "Light or dark interface",
      component: (
        <BaseOptions
          value={settings.themeMode}
          onChange={(newValue) => settings.onUpdate("themeMode", newValue)}
          options={["light", "dark"]}
          icons={["sun", "moon"]}
        />
      ),
    },
    {
      key: "layout",
      icon: <ViewQuiltIcon sx={{ fontSize: 18 }} />,
      title: "Layout",
      description: "Navigation structure",
      component: (
        <LayoutOptions
          value={settings.themeLayout}
          onChange={(newValue) => settings.onUpdate("themeLayout", newValue)}
          options={["vertical", "horizontal", "mini"]}
        />
      ),
    },
    {
      key: "presets",
      icon: <ColorLensIcon sx={{ fontSize: 18 }} />,
      title: "Color Preset",
      description: "Interface color scheme",
      component: (
        <PresetsOptions
          value={settings.themeColorPresets}
          onChange={(newValue) => settings.onUpdate("themeColorPresets", newValue)}
        />
      ),
    },
  ]

  return (
    <Fade in timeout={400}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.grey[900], 0.04)}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            backgroundColor: alpha(theme.palette.grey[50], theme.palette.mode === "dark" ? 0.02 : 1),
            borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: alpha(theme.palette.grey[900], 0.04),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SettingsIcon
                sx={{
                  fontSize: 18,
                  color: theme.palette.text.secondary,
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: "0.95rem",
                }}
              >
                Preferences
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.8rem",
                  mt: -0.25,
                }}
              >
                Customize interface settings
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Accordion Sections */}
        <Box>
          {sections.map((section, index) => (
            <Box key={section.key}>
              <Accordion
                expanded={expanded === section.key}
                onChange={handleChange(section.key)}
                sx={{
                  boxShadow: "none",
                  backgroundColor: "transparent",
                  "&:before": {
                    display: "none",
                  },
                  "&.Mui-expanded": {
                    margin: 0,
                    backgroundColor: alpha(theme.palette.grey[50], theme.palette.mode === "dark" ? 0.02 : 0.5),
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        fontSize: 20,
                        color: theme.palette.text.secondary,
                        transition: "transform 0.2s ease",
                      }}
                    />
                  }
                  sx={{
                    minHeight: 56,
                    px: 3,
                    py: 0,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.grey[50], theme.palette.mode === "dark" ? 0.02 : 0.5),
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: "12px 0",
                      alignItems: "center",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2.5} sx={{ width: "100%" }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.grey[500], 0.08),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ color: theme.palette.text.secondary }}>{section.icon}</Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          fontSize: "0.875rem",
                        }}
                      >
                        {section.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                          mt: 0.25,
                        }}
                      >
                        {section.description}
                      </Typography>
                    </Box>

                    {/* Current Value */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircleIcon
                        sx={{
                          fontSize: 6,
                          color: alpha(theme.palette.text.secondary, 0.4),
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          minWidth: 60,
                          textAlign: "right",
                        }}
                      >
                        {getCurrentValue(section.key)}
                      </Typography>
                    </Stack>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    px: 3,
                    py: 2,
                    pt: 0,
                    backgroundColor: "transparent",
                  }}
                >
                  <Box
                    sx={{
                      ml: 5.5, // Align with content above
                      "& > *": {
                        width: "100%",
                      },
                    }}
                  >
                    {section.component}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Divider between sections */}
              {index < sections.length - 1 && (
                <Divider
                  sx={{
                    mx: 3,
                    borderColor: alpha(theme.palette.grey[500], 0.06),
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
            backgroundColor: alpha(theme.palette.grey[50], theme.palette.mode === "dark" ? 0.01 : 0.3),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.7rem",
              textAlign: "center",
              display: "block",
              fontWeight: 400,
            }}
          >
            Settings auto-save
          </Typography>
        </Box>
      </Paper>
    </Fade>
  )
}

export default SettingsAccordion
