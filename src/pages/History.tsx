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

const API_BASE = import.meta.env.VITE_API_BASE;

interface HistorySession {
  id: number;
  role: string;
  level: string;
  date: string;
  score: number; // <--- Sekarang mengambil skor dari backend
  is_completed: boolean | number;
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
    const token = localStorage.getItem("access_token");

    axios
      .get(`${API_BASE}/history?t=${new Date().getTime()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
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

  // LOGIKA SEARCH DAN FILTER BERFUNGSI (DIPERBARUI)
  const filteredHistory = historyList.filter((item) => {
    const roleName = item.role || "";
    const matchSearch = roleName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchLevel = filterLevel === "All" || item.level === filterLevel;

    const isCompleted = item.is_completed === true || item.is_completed === 1;

    return isCompleted && matchSearch && matchLevel;
  });

  // LOGIKA KALKULASI STATISTIK KESELURUHAN

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
