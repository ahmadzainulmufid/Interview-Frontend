// pages/Register.tsx
import {
  CssBaseline,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

// Import Ikon
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // --- STATE UNTUK TOAST / SNACKBAR ---
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // --- FUNGSI UNTUK MENAMPILKAN TOAST ---
  const showToast = (
    message: string,
    severity: "success" | "error" | "warning",
  ) => {
    setToast({ open: true, message, severity });
  };

  // --- FUNGSI UNTUK MENUTUP TOAST ---
  const handleCloseToast = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setToast({ ...toast, open: false });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  // --- LOGIKA UTAMA KONEKSI KE BACKEND ---
  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showToast("Harap isi semua kolom!", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Kata Sandi dan Konfirmasi Kata Sandi tidak cocok!", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        import.meta.env.VITE_API_BASE + "/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            confirm_password: confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showToast("Registrasi Berhasil! Silakan Masuk.", "success");

        // Beri jeda sedikit sebelum pindah halaman agar toast sukses terlihat
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        showToast(`Gagal: ${data.msg}`, "error");
        setLoading(false); // Matikan loading jika gagal
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      showToast(
        "Tidak dapat terhubung ke server. Pastikan server aktif.",
        "error",
      );
      setLoading(false); // Matikan loading jika error
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#f5f5f5",
      }}
    >
      <CssBaseline />

      {/* --- KOMPONEN TOAST/SNACKBAR --- */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
          <AppRegistrationIcon fontSize="large" />
        </Avatar>

        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: "bold", mb: 1, mt: 1 }}
        >
          Buat Akun Baru
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bergabunglah! Silakan isi data diri Anda
        </Typography>

        <Box component="form" sx={{ width: "100%" }}>
          <Grid container spacing={2}>
            {/* --- USERNAME --- */}
            <Grid>
              <TextField
                name="username"
                required
                fullWidth
                id="username"
                label="Nama Pengguna"
                placeholder="Masukkan Nama Pengguna"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading} // Kunci input saat loading
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* --- EMAIL --- */}
            <Grid>
              <TextField
                required
                fullWidth
                id="email"
                label="Alamat Email"
                name="email"
                placeholder="Masukkan Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} // Kunci input saat loading
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* --- PASSWORD --- */}
            <Grid size={11.8}>
              <TextField
                required
                fullWidth
                name="password"
                label="Kata Sandi"
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Masukkan Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} // Kunci input saat loading
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* --- CONFIRM PASSWORD --- */}
            <Grid size={11.8}>
              <TextField
                required
                fullWidth
                name="confirm_password"
                label="Konfirmasi Kata Sandi"
                type={showPassword ? "text" : "password"}
                id="confirm_password"
                placeholder="Ulangi Kata Sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading} // Kunci input saat loading
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleRegister}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            } // <-- MENAMBAHKAN SPINNER DI DALAM TOMBOL
            sx={{
              mt: 4,
              mb: 3,
              borderRadius: "30px",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              backgroundColor: "primary.main",
              height: "48px",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            {loading ? "Sedang Mendaftar..." : "Daftar"}
          </Button>

          <Grid container justifyContent="center">
            <Grid>
              <Typography variant="body2" color="text.secondary">
                Sudah punya akun?{" "}
                <Link
                  to={loading ? "#" : "/"} // Mencegah klik link saat loading
                  style={{
                    textDecoration: "none",
                    color: loading ? "grey" : "#1976d2",
                    fontWeight: "bold",
                    pointerEvents: loading ? "none" : "auto", // Nonaktifkan link saat loading
                  }}
                >
                  Masuk di sini
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
