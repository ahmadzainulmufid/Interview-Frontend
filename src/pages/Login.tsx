// pages/Login.tsx
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
  CircularProgress, // <-- DITAMBAHKAN UNTUK ANIMASI LOADING
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async () => {
    // 1. Validasi Input
    if (!username || !password) {
      showToast("Nama Pengguna dan Kata Sandi wajib diisi!", "warning");
      return;
    }

    setLoading(true);

    try {
      // 2. Kirim Request ke Backend
      const response = await fetch(import.meta.env.VITE_API_BASE + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      // 3. Cek Respon
      if (response.ok) {
        // --- SUKSES ---
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user_details));

        // Tampilkan Toast Sukses
        showToast(
          `Selamat datang kembali, ${data.user_details.username}!`,
          "success",
        );

        // Beri sedikit jeda agar Toast sempat terlihat sebelum pindah halaman
        setTimeout(() => {
          navigate("/interview-center");
        }, 1500);
      } else {
        // --- GAGAL ---
        showToast(`Login Gagal: ${data.msg}`, "error");
        setLoading(false); // Matikan loading jika gagal
      }
    } catch (error) {
      console.error("Login Error:", error);
      showToast("Tidak dapat terhubung ke server.", "error");
      setLoading(false); // Matikan loading jika error jaringan
    }
    // Catatan: setLoading(false) untuk bagian sukses tidak ditambahkan di blok finally
    // karena kita ingin animasi loading tetap berputar selama jeda 1.5 detik sebelum pindah halaman.
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

      {/* --- KOMPONEN TOAST/SNACKBAR DARI MUI --- */}
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
          <LockOutlinedIcon fontSize="large" />
        </Avatar>

        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: "bold", mb: 1, mt: 1 }}
        >
          Selamat Datang!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Silakan masuk ke akun Anda
        </Typography>

        <Box component="form" sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nama Pengguna"
            name="username"
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

          <TextField
            margin="normal"
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

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleLogin}
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
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            {loading ? "Sedang Memproses..." : "Masuk"}
          </Button>

          <Grid container justifyContent="center">
            <Grid>
              <Typography variant="body2" color="text.secondary">
                Belum punya akun?{" "}
                <Link
                  to={loading ? "#" : "/register"} // Mencegah klik link saat loading
                  style={{
                    textDecoration: "none",
                    color: loading ? "grey" : "#1976d2",
                    fontWeight: "bold",
                    pointerEvents: loading ? "none" : "auto", // Nonaktifkan link saat loading
                  }}
                >
                  Daftar di sini
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
