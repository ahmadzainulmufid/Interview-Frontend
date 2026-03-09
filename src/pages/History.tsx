import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid as Grid,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";

const API_BASE = "http://localhost:5001";

interface HistorySession {
  id: number;
  role: string;
  level: string;
  date: string;
  score: number; // <--- Sekarang mengambil skor dari backend
  is_completed: boolean;
}

const History = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("All"); // State untuk filter dropdown
  const [historyList, setHistoryList] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Dropdown Menu Filter
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    axios
      .get(`${API_BASE}/history`)
      .then((res) => {
        if (res.data.success) {
          setHistoryList(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil riwayat", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // LOGIKA SEARCH DAN FILTER BERFUNGSI
  const filteredHistory = historyList.filter((item) => {
    // 1. Cek Search: Apakah Role mengandung teks yang diketik?
    const matchSearch = item.role
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 2. Cek Filter Level: Apakah Level sesuai dropdown? (Jika 'All', tampilkan semua)
    const matchLevel = filterLevel === "All" || item.level === filterLevel;

    return item.is_completed && matchSearch && matchLevel;
  });

  // LOGIKA KALKULASI STATISTIK KESELURUHAN
  const totalInterviews = filteredHistory.length;
  const overallAverageScore =
    totalInterviews > 0
      ? Math.round(
          filteredHistory.reduce((acc, curr) => acc + curr.score, 0) /
            totalInterviews,
        )
      : 0;

  // Handler Menu Filter
  const handleOpenFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = (level: string) => {
    if (level) setFilterLevel(level);
    setAnchorEl(null);
  };

  const handleOpenResult = (sessionId: number) => {
    navigate("/result", {
      state: { sessionId: sessionId },
    });
  };

  // Helper warna skor
  const getScoreColor = (score: number) => {
    if (score >= 80) return "success.main";
    if (score >= 60) return "primary.main";
    return "warning.main";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 1. HEADER & STATISTIK (Menampilkan Rata-rata Keseluruhan) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Interview History
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Tinjau kembali kinerja masa lalu Anda dan analisis AI.
        </Typography>

        {/* KARTU STATISTIK KESELURUHAN */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.light",
                  color: "primary.main",
                  width: 56,
                  height: 56,
                }}
              >
                <AssessmentIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Total Wawancara
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {totalInterviews}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "success.light",
                  color: "success.main",
                  width: 56,
                  height: 56,
                }}
              >
                <TrendingUpIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Rata-rata Skor Keseluruhan
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {overallAverageScore}%
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 2. SEARCH & FILTER BAR */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "start", md: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Riwayat Anda
        </Typography>

        <Box
          sx={{ display: "flex", gap: 2, width: { xs: "100%", md: "auto" } }}
        >
          <TextField
            placeholder="Cari posisi..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "white", borderRadius: 1 }}
          />
          <Button
            variant={filterLevel !== "All" ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            onClick={handleOpenFilter}
            sx={{
              bgcolor: filterLevel !== "All" ? "primary.main" : "white",
              textTransform: "none",
            }}
          >
            {filterLevel === "All" ? "Filter" : filterLevel}
          </Button>

          {/* MENU DROPDOWN FILTER */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={() => handleCloseFilter("")}
          >
            <MenuItem onClick={() => handleCloseFilter("All")}>
              Semua Level
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleCloseFilter("Junior")}>
              Junior
            </MenuItem>
            <MenuItem onClick={() => handleCloseFilter("Intermediate")}>
              Intermediate
            </MenuItem>
            <MenuItem onClick={() => handleCloseFilter("Senior")}>
              Senior
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* 3. LIST HISTORY */}
      <Grid container spacing={2}>
        {filteredHistory.map((item) => (
          <Grid size={12} key={item.id}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
                transition: "0.2s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
              }}
            >
              {/* Kiri: Info Role */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flex: 1,
                  width: "100%",
                }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "primary.light",
                    color: "primary.main",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                  }}
                >
                  {item.role.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {item.role}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <CalendarTodayIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {item.date}
                      </Typography>
                    </Box>
                    <Chip label={item.level} size="small" variant="outlined" />
                  </Stack>
                </Box>
              </Box>

              {/* Tengah: Skor Spesifik Sesi */}
              <Box
                sx={{
                  textAlign: "center",
                  minWidth: 100,
                  borderLeft: { sm: "1px solid #eee" },
                  borderRight: { sm: "1px solid #eee" },
                  px: { sm: 3 },
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Nilai Sesi
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={getScoreColor(item.score)}
                >
                  {item.score}%
                </Typography>
              </Box>

              {/* Kanan: Button Arahkan ke Result */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  width: { xs: "100%", sm: "auto" },
                  justifyContent: { xs: "space-between", sm: "flex-end" },
                }}
              >
                <Chip
                  label="Completed"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleOpenResult(item.id)}
                  sx={{ borderRadius: 20, textTransform: "none" }}
                >
                  View Analysis
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}

        {filteredHistory.length === 0 && (
          <Box sx={{ width: "100%", textAlign: "center", mt: 5, opacity: 0.5 }}>
            <Typography variant="h6">
              Riwayat wawancara tidak ditemukan.
            </Typography>
          </Box>
        )}
      </Grid>
    </Box>
  );
};

export default History;
