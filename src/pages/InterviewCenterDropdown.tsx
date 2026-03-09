import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5001/";

const InterviewCenterDropdown: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  // 🔹 Fetch Categories (First Load)
  useEffect(() => {
    axios.get(`${API_BASE}/categories`).then((res) => {
      setCategories(res.data);
    });
  }, []);

  // 🔹 Fetch Roles when Category Changes
  useEffect(() => {
    if (!selectedCategory) return;

    axios
      .get(`${API_BASE}/roles?category_id=${selectedCategory}`)
      .then((res) => {
        setRoles(res.data);
        setSelectedRole("");
        setPositions([]);
      });
  }, [selectedCategory]);

  // 🔹 Fetch Positions when Role Changes
  useEffect(() => {
    if (!selectedRole) return;

    axios.get(`${API_BASE}/positions?role_id=${selectedRole}`).then((res) => {
      setPositions(res.data);
      setSelectedPosition("");
    });
  }, [selectedRole]);

  const handleStartInterview = () => {
    // Cari nama dari ID yang dipilih
    const roleData = roles.find((r) => r.id === selectedRole);
    const positionData = positions.find((p) => p.id === selectedPosition);

    navigate("/interview", {
      state: {
        roleName: roleData ? roleData.name : "Software Engineer",
        levelName: positionData ? positionData.level : "Junior",
      },
    });
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Pilih Posisi Interview
      </Typography>

      {/* CATEGORY */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          label="Category"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ROLE */}
      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCategory}>
        <InputLabel>Role</InputLabel>
        <Select
          value={selectedRole}
          label="Role"
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* POSITION (Level) */}
      <FormControl fullWidth disabled={!selectedRole}>
        <InputLabel>Level</InputLabel>
        <Select
          value={selectedPosition}
          label="Level"
          onChange={(e) => setSelectedPosition(e.target.value)}
        >
          {positions.map((pos) => (
            <MenuItem key={pos.id} value={pos.id}>
              {pos.level}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        fullWidth
        size="large"
        disabled={!selectedPosition}
        onClick={handleStartInterview}
        sx={{ mt: 3 }}
      >
        Mulai Wawancara
      </Button>
    </Box>
  );
};

export default InterviewCenterDropdown;
