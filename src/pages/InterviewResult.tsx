import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import LightbulbCircleIcon from "@mui/icons-material/LightbulbCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Icon untuk tombol Back

const API_BASE = "http://localhost:5001";

interface HistoryItem {
  stage: string;
  question: string;
  user_answer: string;
  score: number;
  feedback: string;
}

interface InterviewData {
  id: number;
  role: string;
  level: string;
  is_completed: boolean;
  final_report: string;
  history: HistoryItem[];
}

const InterviewResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId } = location.state || {};

  const [sessionData, setSessionData] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const token = localStorage.getItem("access_token");

    axios
      .get(`${API_BASE}/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;

          if (data.is_completed === false) {
            alert(
              "Laporan belum tersedia karena sesi wawancara belum selesai.",
            );

            navigate("/interview-center");
            return;
          }
          setSessionData(data);
        }
      })
      .catch((err) => console.error("Gagal memuat hasil:", err))
      .finally(() => setLoading(false));
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 10,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Menyusun Laporan Wawancara...</Typography>
      </Box>
    );
  }

  if (!sessionData)
    return (
      <Typography sx={{ mt: 10, textAlign: "center" }}>
        Data tidak ditemukan.
      </Typography>
    );

  // Filter History berdasarkan Stage
  const openingHistory = sessionData.history.filter(
    (h) => h.stage === "Opening",
  );
  const technicalHistory = sessionData.history.filter(
    (h) => h.stage === "Technical",
  );
  const caseHistory = sessionData.history.filter(
    (h) =>
      h.stage === "Study Case" ||
      h.stage === "Soft Skill" ||
      h.stage === "Behavioral",
  );

  const renderFormattedReport = (reportText: string) => {
    if (!reportText) return <Typography>Laporan belum tersedia.</Typography>;
    const paragraphs = reportText.split("\n").filter((p) => p.trim() !== "");
    return paragraphs.map((text, idx) => {
      if (text.startsWith("**") || text.match(/^\d+\.\s\*\*/)) {
        return (
          <Typography
            key={idx}
            variant="subtitle1"
            fontWeight="bold"
            sx={{ mt: 2, mb: 1, color: "primary.main" }}
          >
            {text.replace(/\*\*/g, "")}
          </Typography>
        );
      }
      if (text.startsWith("- ")) {
        return (
          <Typography key={idx} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
            • {text.substring(2)}
          </Typography>
        );
      }
      return (
        <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
          {text}
        </Typography>
      );
    });
  };

  // Komponen Reusable untuk Render Q&A Block
  const renderQnABlock = (item: HistoryItem, index: number) => (
    <Box key={index} sx={{ mb: 4 }}>
      {/* Pertanyaan AI */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          borderRadius: "12px",
          bgcolor: "#f3e5f5",
          mb: 1,
        }}
      >
        <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
          <SmartToyIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography
            variant="caption"
            fontWeight="bold"
            color="secondary.main"
          >
            IMa (Interviewer)
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
            {item.question}
          </Typography>
        </Box>
      </Box>

      {/* Jawaban User */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          borderRadius: "12px",
          bgcolor: "#e3f2fd",
          ml: 4,
          mb: 1,
        }}
      >
        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
          <PersonIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="caption" fontWeight="bold" color="primary.main">
            Kandidat
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
            {item.user_answer || "Tidak ada jawaban."}
          </Typography>
        </Box>
      </Box>

      {/* Technical Gap / Evaluasi */}
      <Box
        sx={{
          ml: 8,
          p: 2,
          bgcolor: "#fff8e1",
          borderRadius: "8px",
          borderLeft: "5px solid #ffb300",
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <LightbulbCircleIcon sx={{ color: "#ff8f00", mt: 0.5 }} />
        <Box>
          <Typography
            variant="caption"
            fontWeight="bold"
            color="#ff8f00"
            sx={{ display: "block", mb: 0.5 }}
          >
            💡 Technical Gap & Evaluasi AI
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", lineHeight: 1.6 }}
          >
            Score: <strong>{item.score}/100</strong> | {item.feedback}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{ maxWidth: 1200, mx: "auto", mt: 2, mb: 8, px: { xs: 2, md: 4 } }}
    >
      {/* TOMBOL KEMBALI */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/history", { replace: true })} // <--- UBAH DI SINI
        sx={{
          mb: 2,
          color: "text.secondary",
          textTransform: "none",
          fontWeight: "bold",
        }}
      >
        Kembali ke Riwayat
      </Button>

      {/* HEADER */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: "16px",
          mb: 4,
          bgcolor: "#f8f9fa",
        }}
      >
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Wawancara Selesai
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          <Chip
            label={`Posisi: ${sessionData.role}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Level: ${sessionData.level}`}
            color="secondary"
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* FINAL REPORT */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: "16px",
          mb: 4,
          borderLeft: "6px solid",
          borderColor: "primary.main",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={3}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          📊 Analisis & Laporan Akhir
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ bgcolor: "#fff", p: 2, borderRadius: 2 }}>
          {renderFormattedReport(sessionData.final_report)}
        </Box>
      </Paper>

      {/* TRANSKRIP TERPISAH BERDASARKAN STAGE */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: "16px" }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          📝 Riwayat Transkrip Lengkap
        </Typography>

        {/* OPENING SECTION */}
        {openingHistory.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Divider sx={{ mb: 2 }}>
              <Chip label="OPENING" color="primary" size="small" />
            </Divider>
            {openingHistory.map((item, idx) => renderQnABlock(item, idx))}
          </Box>
        )}

        {/* TECHNICAL SECTION */}
        {technicalHistory.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Divider sx={{ mb: 2 }}>
              <Chip label="TECHNICAL SESSION" color="secondary" size="small" />
            </Divider>
            {technicalHistory.map((item, idx) => renderQnABlock(item, idx))}
          </Box>
        )}

        {/* STUDY CASE SECTION */}
        {caseHistory.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Divider sx={{ mb: 2 }}>
              <Chip
                label="STUDY CASE & PROBLEM SOLVING"
                color="error"
                size="small"
              />
            </Divider>
            {caseHistory.map((item, idx) => renderQnABlock(item, idx))}
          </Box>
        )}

        {sessionData.history.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Transkrip tidak tersedia.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default InterviewResult;
