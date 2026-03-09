// pages/Dashboard.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Stack,
} from "@mui/material";

// Icons
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CodeIcon from "@mui/icons-material/Code";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // --- STATE ---
  // Kita cek localStorage saat awal load agar data tidak hilang saat refresh
  const [candidateId, setCandidateId] = useState<number | null>(() => {
    const saved = localStorage.getItem("candidateId");
    return saved ? parseInt(saved) : null;
  });

  const [analysisData, setAnalysisData] = useState<{
    role: string;
    matchScore: number;
    hardSkills: string[];
    softSkills: string[];
  } | null>(() => {
    const saved = localStorage.getItem("analysisData");
    return saved ? JSON.parse(saved) : null;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- DATA STATS (Static) ---
  const stats = [
    {
      label: "Total Simulations",
      value: "12",
      subtext: "Sessions completed",
      icon: <WorkHistoryIcon />,
      color: "#4caf50",
    },
    {
      label: "Job Readiness",
      value: "High",
      subtext: "Based on last 3 scores",
      icon: <SchoolIcon />,
      color: "#2196f3",
    },
    {
      label: "Questions Mastered",
      value: "45",
      subtext: "Answers rated > 90%",
      icon: <QuestionAnswerIcon />,
      color: "#ff9800",
    },
  ];

  const recentInterviews = [
    {
      role: "Frontend Developer",
      date: "29 Dec",
      matchScore: 92,
      tags: ["React", "System Design"],
      status: "Excellent",
    },
    {
      role: "React Native Dev",
      date: "25 Dec",
      matchScore: 78,
      tags: ["Mobile", "Native Modules"],
      status: "Good",
    },
    {
      role: "Backend Engineer",
      date: "22 Dec",
      matchScore: 65,
      tags: ["Node.js", "API"],
      status: "Fair",
    },
  ];

  const improvementAreas = [
    { area: "Speaking Confidence", score: 60, color: "warning" },
    { area: "Technical Depth", score: 85, color: "success" },
    { area: "Body Language", score: 70, color: "primary" },
    { area: "Answer Structure", score: 55, color: "warning" },
  ];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    // Reset data lama
    setAnalysisData(null);
    setCandidateId(null);
    localStorage.removeItem("candidateId");
    localStorage.removeItem("analysisData");

    const formData = new FormData();
    formData.append("file", file);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    formData.append("name", user.username || "Guest Candidate");

    try {
      const response = await fetch("http://127.0.0.1:5000/upload-cv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const newAnalysis = {
          role: data.analysis.role,
          matchScore: data.analysis.matchScore,
          hardSkills: data.analysis.hardSkills,
          softSkills: data.analysis.softSkills,
        };

        // Simpan ke State & LocalStorage
        setCandidateId(data.candidate_id);
        setAnalysisData(newAnalysis);
        localStorage.setItem("candidateId", data.candidate_id.toString());
        localStorage.setItem("analysisData", JSON.stringify(newAnalysis));
      } else {
        alert(`Upload Gagal: ${data.msg}`);
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Gagal terhubung ke server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = async () => {
    if (!candidateId) {
      setAnalysisData(null);
      return;
    }

    try {
      await fetch(`http://127.0.0.1:5000/delete-cv/${candidateId}`, {
        method: "DELETE",
      });
      console.log(`Candidate ${candidateId} deleted.`);
    } catch (error) {
      console.error("Gagal menghapus data:", error);
    } finally {
      // Hapus data dari UI & Storage
      setAnalysisData(null);
      setCandidateId(null);
      localStorage.removeItem("candidateId");
      localStorage.removeItem("analysisData");
    }
  };

  const handleStartSession = () => {
    if (candidateId) {
      navigate("/interview", { state: { candidateId: candidateId } });
    } else {
      alert("Harap upload CV terlebih dahulu.");
    }
  };

  // Log untuk debugging state
  useEffect(() => {
    console.log(
      "Dashboard State -> ID:",
      candidateId,
      "Analysis:",
      analysisData
    );
  }, [candidateId, analysisData]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Hello, Candidate! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your preparation and let AI identify your blind spots.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 1. STATS CARDS */}
        {stats.map((stat, index) => (
          // PERBAIKAN GRID: Gunakan prop 'size'
          <Grid size={{ xs: 12, sm: 4 }} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="text.primary"
                >
                  {stat.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.subtext}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: stat.color + "20",
                  color: stat.color,
                  width: 56,
                  height: 56,
                }}
              >
                {stat.icon}
              </Avatar>
            </Paper>
          </Grid>
        ))}

        {/* 2. HERO CARD (UPLOAD / ANALYSIS) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 4,
              background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "380px",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                maxWidth: "650px",
                mx: "auto",
              }}
            >
              {/* TAMPILAN UPLOAD (Jika belum ada data analisis) */}
              {!analysisData && !isAnalyzing && (
                <>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Generate Your Custom Interview
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                    Upload your CV (PDF). Our AI creates realistic questions
                    based on your actual experience.
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    size="large"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      bgcolor: "white",
                      color: "#1565c0",
                      fontWeight: "bold",
                      borderRadius: "30px",
                      py: 1.5,
                      px: 4,
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    Upload CV to Start
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </>
              )}

              {/* TAMPILAN LOADING */}
              {isAnalyzing && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <CircularProgress size={60} sx={{ color: "white", mb: 3 }} />
                  <Typography variant="h6">
                    Analyzing Skills & Experience...
                  </Typography>
                </Box>
              )}

              {/* TAMPILAN HASIL ANALISIS */}
              {analysisData && !isAnalyzing && (
                <Stack spacing={2} alignItems="center">
                  <Chip
                    icon={<AutoAwesomeIcon />}
                    label={`Match Score: ${analysisData.matchScore}%`}
                    color="success"
                    sx={{
                      bgcolor: "#66bb6a",
                      color: "white",
                      fontWeight: "bold",
                      py: 2,
                    }}
                  />
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      p: 3,
                      borderRadius: 3,
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.8, textTransform: "uppercase" }}
                    >
                      Recommended Role
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                      {analysisData.role}
                    </Typography>
                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mb={1}
                        >
                          <CodeIcon fontSize="small" />
                          <Typography variant="subtitle2" fontWeight="bold">
                            Technical Focus
                          </Typography>
                        </Stack>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {analysisData.hardSkills.map((skill) => (
                            <Chip
                              key={skill}
                              size="small"
                              label={skill}
                              sx={{
                                bgcolor: "rgba(0,188,212, 0.2)",
                                color: "#e0f7fa",
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mb={1}
                        >
                          <PsychologyIcon fontSize="small" />
                          <Typography variant="subtitle2" fontWeight="bold">
                            Behavioral Focus
                          </Typography>
                        </Stack>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {analysisData.softSkills.map((skill) => (
                            <Chip
                              key={skill}
                              size="small"
                              label={skill}
                              sx={{
                                bgcolor: "rgba(255,152,0, 0.2)",
                                color: "#fff3e0",
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="text"
                      sx={{ color: "white", mr: 2 }}
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayCircleOutlineIcon />}
                      onClick={handleStartSession}
                      sx={{
                        bgcolor: "white",
                        color: "#1565c0",
                        fontWeight: "bold",
                        borderRadius: "30px",
                        px: 4,
                      }}
                    >
                      Start Session
                    </Button>
                  </Box>
                </Stack>
              )}
            </Box>
            <DescriptionIcon
              sx={{
                position: "absolute",
                right: -30,
                bottom: -30,
                fontSize: 200,
                opacity: 0.1,
              }}
            />
          </Paper>
        </Grid>

        {/* 3. AREAS TO IMPROVE */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Areas to Improve
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={3}
            >
              Focus on these areas to increase passing rate.
            </Typography>
            {improvementAreas.map((item, index) => (
              <Box key={index} sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {item.area}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={`${item.color}.main`}
                  >
                    {item.score < 70 ? "Needs Work" : "Good"} ({item.score}%)
                  </Typography>
                </Box>
                {/* Pastikan tipe warna valid */}
                <LinearProgress
                  variant="determinate"
                  value={item.score}
                  color={item.color as "primary" | "warning" | "success"}
                  sx={{ height: 8, borderRadius: 5, bgcolor: "#f0f0f0" }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* 4. RECENT SESSIONS */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={2}
            sx={{ p: 0, borderRadius: 3, overflow: "hidden" }}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ px: 1 }}>
                Recent Practice Sessions
              </Typography>
              <Button endIcon={<ArrowForwardIcon />} size="small">
                View History
              </Button>
            </Box>
            <Divider />
            <Grid
              container
              sx={{
                px: 3,
                py: 1,
                bgcolor: "#f9f9f9",
                display: { xs: "none", md: "flex" },
              }}
            >
              <Grid size={{ xs: 5 }}>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  ROLE & DATE
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  FOCUS TOPICS
                </Typography>
              </Grid>
              <Grid size={{ xs: 3 }} sx={{ textAlign: "right" }}>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  RESULT
                </Typography>
              </Grid>
            </Grid>
            {recentInterviews.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderBottom:
                    index !== recentInterviews.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  "&:hover": { bgcolor: "#f5f9ff" },
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: item.matchScore > 80 ? "#e8f5e9" : "#fff3e0",
                          color: item.matchScore > 80 ? "#2e7d32" : "#ed6c02",
                        }}
                      >
                        {item.matchScore > 80 ? "A" : "B"}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.date}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack direction="row" spacing={1}>
                      {item.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ fontSize: "0.7rem", height: 24 }}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: { xs: "flex-start", md: "flex-end" },
                        gap: 2,
                      }}
                    >
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          Match Score
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          lineHeight={1}
                          color="primary"
                        >
                          {item.matchScore}%
                        </Typography>
                      </Box>
                      <Chip
                        label={item.status}
                        color={item.matchScore > 80 ? "success" : "warning"}
                        size="small"
                        variant="filled"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
