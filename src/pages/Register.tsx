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
} from "@mui/material";

// Import Ikon
import PersonAddIcon from "@mui/icons-material/PersonAdd";
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
  const [loading, setLoading] = useState(false); // Tambahan state loading

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const navigate = useNavigate();

  // --- LOGIKA UTAMA KONEKSI KE BACKEND ---
  const handleRegister = async () => {
    // 1. Validasi Client Side Sederhana
    if (!username || !email || !password || !confirmPassword) {
      alert("Harap isi semua kolom!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password dan Confirm Password tidak sama!");
      return;
    }

    setLoading(true); // Aktifkan loading agar user tidak klik 2x

    try {
      // 2. Kirim Request ke Flask Backend
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          // PENTING: Backend minta 'confirm_password', bukan 'confirmPassword'
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      // 3. Cek Respon
      if (response.ok) {
        // Jika sukses (HTTP 201)
        alert("✅ Registrasi Berhasil! Silakan Login.");
        navigate("/login");
      } else {
        // Jika gagal (HTTP 400/409), tampilkan pesan dari backend (data.msg)
        alert(`❌ Gagal: ${data.msg}`);
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert(
        "❌ Tidak dapat terhubung ke server. Pastikan backend Flask menyala."
      );
    } finally {
      setLoading(false);
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
        background: "linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)",
      }}
    >
      <CssBaseline />

      <Paper
        elevation={10}
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
        <Avatar sx={{ m: 1, bgcolor: "#64b5f6", width: 56, height: 56 }}>
          <PersonAddIcon fontSize="large" />
        </Avatar>

        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Join us! Please fill in your details
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
                label="Username"
                placeholder="Input Username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                label="Email Address"
                name="email"
                placeholder="Input Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <Grid size={11.3}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Input Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* --- CONFIRM PASSWORD --- */}
            <Grid size={11.3}>
              <TextField
                required
                fullWidth
                name="confirm_password"
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                id="confirm_password"
                placeholder="Input Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            disabled={loading} // Disable tombol saat loading
            sx={{
              mt: 3,
              mb: 2,
              borderRadius: "30px",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              backgroundColor: "#1976d2",
              height: "48px",
            }}
            onClick={handleRegister}
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          <Grid container justifyContent="center">
            <Grid>
              <Typography variant="body2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    color: "#1976d2",
                    fontWeight: "bold",
                  }}
                >
                  Login
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
