import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import { Work, Mic, Assessment } from "@mui/icons-material";

const steps = [
  {
    label: "Pilih Posisi Impianmu",
    description:
      "Cari dan pilih posisi pekerjaan yang sesuai dengan keahlianmu. Pastikan kamu membaca deskripsi pekerjaan dengan teliti.",
    icon: <Work color="primary" />,
  },
  {
    label: "Wawancara Suara Langsung",
    description:
      "Masuki ruang wawancara virtual. Kamu akan menjawab pertanyaan menggunakan suara secara real-time. Siapkan mikrofon dan tempat yang tenang!",
    icon: <Mic color="primary" />,
  },
  {
    label: "Dapatkan Masukan Instan",
    description:
      "Setelah selesai, sistem AI kami akan memberikan feedback langsung mengenai performamu untuk membantumu berkembang.",
    icon: <Assessment color="primary" />,
  },
];

const InterviewCenter: React.FC = () => {
  // 1. Pindahkan useState ke DALAM komponen
  // Kosongkan nama awalnya, nanti akan diisi oleh useEffect
  const [username, setUsername] = useState("");

  // 2. Ambil data nama asli pengguna dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUsername(userData.username); // Set username sesuai yang login
    } else {
      setUsername("Calon Kandidat"); // Jika tidak ada data login
    }
  }, []);

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Box sx={{ mb: 4, textAlign: "left" }}>
        {/* 3. Penulisan pemanggilan variabel yang benar: {username} tanpa lambang $ */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Halo, {username}! 👋
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Ikuti 3 langkah mudah di bawah ini untuk memulai perjalanan kariermu.
        </Typography>
      </Box>

      <Stepper orientation="vertical">
        {steps.map((step) => (
          <Step key={step.label} active={true}>
            <StepLabel StepIconComponent={() => step.icon}>
              <Typography variant="h6" fontWeight="bold">
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {step.description}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default InterviewCenter;
