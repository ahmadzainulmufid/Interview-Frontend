import React, { useState } from "react";
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
  const [username] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.username;
      } catch (error) {
        console.error("Gagal parse data user:", error);
        return "Calon Kandidat";
      }
    }
    return "Calon Kandidat";
  });

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Box sx={{ mb: 4, textAlign: "left" }}>
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
