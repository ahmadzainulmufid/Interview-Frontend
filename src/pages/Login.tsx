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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Tambahan state loading

  const navigate = useNavigate();

  const handleLogin = async () => {
    // 1. Validasi Input
    if (!username || !password) {
      alert("Username dan Password wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      // 2. Kirim Request ke Backend
      const response = await fetch("http://127.0.0.1:5000/login", {
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
        console.log("Login Success:", data);

        // PENTING: Simpan token ke localStorage agar browser "ingat" user sedang login
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        // Opsional: Simpan detail user
        localStorage.setItem("user", JSON.stringify(data.user_details));

        alert(`Selamat datang kembali, ${data.user_details.username}!`);
        navigate("/dashboard");
      } else {
        // --- GAGAL ---
        alert(`❌ Login Gagal: ${data.msg}`);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Tidak dapat terhubung ke server.");
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
          <LockOutlinedIcon fontSize="large" />
        </Avatar>

        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Welcome Back!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please login to continue
        </Typography>

        <Box component="form" sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
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

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
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
            }}
          />

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
            }}
            onClick={handleLogin}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Grid container justifyContent="center">
            <Grid>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    textDecoration: "none",
                    color: "#1976d2",
                    fontWeight: "bold",
                  }}
                >
                  Register
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
