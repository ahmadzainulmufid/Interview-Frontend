import { useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // State untuk mengontrol buka/tutup Modal Konfirmasi Logout
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { username: "User" };

  // Deteksi rute mana yang sedang aktif
  const isInterviewMode = location.pathname === "/interview";
  const isInterviewResult = location.pathname.startsWith("/result");
  const isInterviewCenter =
    location.pathname === "/interview-center" || location.pathname === "/";

  // HANYA sembunyikan sidebar saat Interview Mode (Kamera/Wawancara berlangsung)
  const hideSidebar = isInterviewMode;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // --- FUNGSI UNTUK LOGOUT ---
  const handleLogoutClick = () => {
    setOpenLogoutDialog(true); // Tampilkan dialog saat tombol logout diklik
  };

  const handleCancelLogout = () => {
    setOpenLogoutDialog(false); // Tutup dialog jika batal
  };

  const handleConfirmLogout = () => {
    // Eksekusi proses logout
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setOpenLogoutDialog(false);
    navigate("/");
  };

  const menuItems = [
    {
      text: "Interview Center",
      icon: <DashboardIcon />,
      path: "/interview-center",
    },
    {
      text: "Interview Room",
      icon: <VideoCameraFrontIcon />,
      path: "/position",
    },
    { text: "Interview History", icon: <AssessmentIcon />, path: "/history" },
  ];

  // Menentukan judul header secara dinamis
  const getHeaderTitle = () => {
    if (isInterviewResult) return "Interview Result";

    const menuItem = menuItems.find((i) => i.path === location.pathname);
    if (menuItem) return menuItem.text;

    return "Dashboard";
  };

  // Fungsi agar "Interview History" tetap menyala saat berada di halaman Result
  const isMenuActive = (path: string) => {
    if (isInterviewResult && path === "/history") return true;
    return location.pathname === path;
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
        }}
      >
        <Typography variant="h6" color="primary" fontWeight="bold">
          InterviewMate
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isMenuActive(item.path)}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon
                sx={{
                  color: isMenuActive(item.path) ? "primary.main" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: isMenuActive(item.path) ? "primary.main" : "inherit",
                  fontWeight: isMenuActive(item.path) ? "bold" : "normal",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          {/* Ubah onClick menjadi handleLogoutClick */}
          <ListItemButton onClick={handleLogoutClick}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{ color: "error.main", fontWeight: "bold" }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* --- DIALOG KONFIRMASI LOGOUT --- */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleCancelLogout}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: "bold" }}>
          {"Konfirmasi Keluar"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Apakah Anda yakin ingin keluar dari akun ini? Anda harus masuk
            kembali untuk melanjutkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCancelLogout}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmLogout}
            color="error"
            variant="contained"
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            Ya, Keluar
          </Button>
        </DialogActions>
      </Dialog>

      {/* APP BAR (HEADER) */}
      {!isInterviewMode && (
        <AppBar
          position="fixed"
          sx={{
            width: hideSidebar
              ? "100%"
              : { sm: `calc(100% - ${drawerWidth}px)` },
            ml: hideSidebar ? 0 : { sm: `${drawerWidth}px` },
            bgcolor: "white",
            color: "black",
            boxShadow: 1,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: "width 0.2s ease, margin 0.2s ease",
          }}
        >
          <Toolbar>
            {!hideSidebar && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, fontWeight: "bold" }}
            >
              {getHeaderTitle()}
            </Typography>

            <Avatar sx={{ bgcolor: "primary.main" }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
          </Toolbar>
        </AppBar>
      )}

      {/* SIDEBAR (DRAWER) */}
      {!hideSidebar && (
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isInterviewMode || isInterviewCenter ? 0 : 3,
          mt: isInterviewMode ? 0 : 8,
          width: hideSidebar ? "100%" : { sm: `calc(100% - ${drawerWidth}px)` },
          transition: "width 0.2s ease",
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Sidebar;
