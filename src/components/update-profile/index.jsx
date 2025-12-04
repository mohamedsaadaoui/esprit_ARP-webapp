import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import {
  Box,
  Grid,
  Avatar,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import EditIcon from "@mui/icons-material/Edit"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import ImageValidationStepper from "../image-validation-stepper"

export default function ProfileEdit({ open, onClose, profileData, onSave }) {
  const theme = useTheme()
  const [editFormData, setEditFormData] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImageForValidation, setSelectedImageForValidation] = useState(null)
  const [showImageStepper, setShowImageStepper] = useState(false)

  // Initialize form data when profileData changes
  useEffect(() => {
    if (profileData) {
      setEditFormData(profileData)
      setImagePreview(null)
    }
  }, [profileData])

  const handleClose = () => {
    setEditFormData(profileData || {})
    setImagePreview(null)
    setSelectedImageForValidation(null)
    setShowImageStepper(false)
    onClose()
  }

  const handleFormChange = (field) => (event) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      // Basic validation
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner un fichier image valide")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("La taille du fichier ne doit pas dépasser 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result
        setSelectedImageForValidation(base64String)
        setShowImageStepper(true)
      }
      reader.readAsDataURL(file)
    }

    // Reset the input to allow re-uploading the same file
    event.target.value = ""
  }

  const handleImageValidated = (validatedImage) => {
    setImagePreview(validatedImage)
    setEditFormData((prev) => ({
      ...prev,
      base64Image: validatedImage,
    }))
    setShowImageStepper(false)
    setSelectedImageForValidation(null)
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!editFormData.nom || !editFormData.prenom || !editFormData.email) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editFormData.email)) {
        alert("Veuillez entrer une adresse email valide")
        return
      }

      await onSave(editFormData)
      handleClose()
    } catch (err) {
      console.error("Error updating profile:", err)
      alert("Erreur lors de la mise à jour du profil")
    }
  }

  return (
    <>
      <Dialog
        open={open && !showImageStepper}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "white",
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Modifier le Profil
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 2 }}>
          {/* Profile Photo Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: theme.palette.primary.main,
                fontWeight: "bold",
              }}
            >
              Photo de Profil
            </Typography>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={imagePreview || editFormData.base64Image}
                alt="Profile Preview"
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  border: `3px solid ${theme.palette.primary.main}`,
                  boxShadow: theme.shadows[5],
                }}
              />
              {/* --- FIX START --- */}
              <Button
                component="label"
                variant="contained"
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: -10,
                  minWidth: "auto",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.8),
                  },
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 16 }} />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
              {/* --- FIX END --- */}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Cliquez sur l&apos;icône pour changer votre photo
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Votre photo sera validée selon nos critères de qualité
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom *"
                value={editFormData.prenom || ""}
                onChange={handleFormChange("prenom")}
                variant="outlined"
                required
                error={!editFormData.prenom}
                helperText={!editFormData.prenom ? "Ce champ est obligatoire" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom *"
                value={editFormData.nom || ""}
                onChange={handleFormChange("nom")}
                variant="outlined"
                required
                error={!editFormData.nom}
                helperText={!editFormData.nom ? "Ce champ est obligatoire" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={editFormData.email || ""}
                onChange={handleFormChange("email")}
                variant="outlined"
                required
                error={!editFormData.email}
                helperText={!editFormData.email ? "Ce champ est obligatoire" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={editFormData.telephone || ""}
                onChange={handleFormChange("telephone")}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationalité"
                value={editFormData.nationalite || ""}
                onChange={handleFormChange("nationalite")}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lieu de Naissance"
                value={editFormData.lieuNaissance || ""}
                onChange={handleFormChange("lieuNaissance")}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: alpha(theme.palette.text.secondary, 0.1),
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.8),
              },
            }}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Validation Stepper */}
      <Backdrop sx={{ color: "#fff", zIndex: 1200 }} open={showImageStepper}>
        <ImageValidationStepper
          open={showImageStepper}
          onClose={() => {
            setShowImageStepper(false)
            setSelectedImageForValidation(null)
          }}
          onImageValidated={handleImageValidated}
          selectedImage={selectedImageForValidation}
        />
      </Backdrop>
    </>
  )
}

// Props validation
ProfileEdit.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  profileData: PropTypes.shape({
    nom: PropTypes.string,
    prenom: PropTypes.string,
    email: PropTypes.string,
    telephone: PropTypes.string,
    nationalite: PropTypes.string,
    lieuNaissance: PropTypes.string,
    base64Image: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
}

ProfileEdit.defaultProps = {
  profileData: {},
}