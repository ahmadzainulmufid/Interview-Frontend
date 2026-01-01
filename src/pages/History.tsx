import { useState } from "react";
import {
  Box,
  Typography,
  Grid as Grid,
  Paper,
  Chip,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  Stack,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

// --- TYPES ---
interface Skill {
  name: string;
  score: number;
}

interface Feedback {
  type: "positive" | "negative";
  text: string;
}

interface SessionDetails {
  summary: string;
  skills: Skill[];
  feedback: Feedback[];
}

interface HistorySession {
  id: number;
  role: string;
  date: string;
  duration: string;
  score: number;
  status: string;
  details: SessionDetails;
}

// --- MOCK DATA HISTORY ---
const mockHistory: HistorySession[] = [
  {
    id: 1,
    role: "Frontend Developer",
    date: "29 Dec 2025",
    duration: "15m 30s",
    score: 88,
    status: "Excellent",
    details: {
      summary:
        "Strong understanding of React hooks and component lifecycle. Good explanation of state management. However, could improve on CSS architecture explanation.",
      skills: [
        { name: "Technical Knowledge", score: 90 },
        { name: "Communication", score: 85 },
        { name: "Problem Solving", score: 80 },
        { name: "Confidence", score: 95 },
      ],
      feedback: [
        { type: "positive", text: "Clear voice and good eye contact." },
        { type: "positive", text: "Explained 'useEffect' perfectly." },
        { type: "negative", text: "Paused too long on the CSS grid question." },
      ],
    },
  },
  {
    id: 2,
    role: "React Native Developer",
    date: "25 Dec 2025",
    duration: "12m 00s",
    score: 72,
    status: "Good",
    details: {
      summary:
        "Good general knowledge but struggled with native module concepts. Communication was clear but appeared slightly nervous.",
      skills: [
        { name: "Technical Knowledge", score: 65 },
        { name: "Communication", score: 80 },
        { name: "Problem Solving", score: 70 },
        { name: "Confidence", score: 60 },
      ],
      feedback: [
        { type: "positive", text: "Great attitude and polite." },
        { type: "negative", text: "Looked away from camera frequently." },
        { type: "negative", text: "Answer regarding 'Bridging' was vague." },
      ],
    },
  },
  {
    id: 3,
    role: "UI/UX Designer",
    date: "20 Dec 2025",
    duration: "20m 10s",
    score: 65,
    status: "Needs Improvement",
    details: {
      summary:
        "Portfolio presentation was good, but lacked depth in UX research methodology explanation.",
      skills: [
        { name: "Design Thinking", score: 80 },
        { name: "Communication", score: 60 },
        { name: "Methodology", score: 50 },
        { name: "Confidence", score: 70 },
      ],
      feedback: [
        { type: "positive", text: "Visuals provided were stunning." },
        { type: "negative", text: "Spoke too fast, hard to follow." },
      ],
    },
  },
];

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);

  // Filter Data
  const filteredHistory = mockHistory.filter((item) =>
    item.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Dialog
  const handleOpenDetails = (session: HistorySession) => {
    setSelectedSession(session);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSession(null);
  };

  // Helper warna score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "success.main";
    if (score >= 70) return "primary.main";
    return "warning.main";
  };

  return (
    <Box>
      {/* 1. HEADER & SEARCH */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "start", md: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Interview History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review your past performance and AI analysis.
          </Typography>
        </Box>

        <Box
          sx={{ display: "flex", gap: 2, width: { xs: "100%", md: "auto" } }}
        >
          <TextField
            placeholder="Search role..."
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
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{ bgcolor: "white", textTransform: "none" }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* 2. LIST HISTORY */}
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
                  {item.role.charAt(0)}
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
                    <Typography variant="caption" color="text.secondary">
                      • {item.duration}
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              {/* Tengah: Score */}
              <Box sx={{ textAlign: "center", minWidth: 100 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Overall Score
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={getScoreColor(item.score)}
                >
                  {item.score}
                </Typography>
              </Box>

              {/* Kanan: Status & Button */}
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
                  label={item.status}
                  color={
                    item.score >= 80
                      ? "success"
                      : item.score >= 70
                      ? "primary"
                      : "warning"
                  }
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleOpenDetails(item)}
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
            <Typography variant="h6">No interview history found.</Typography>
          </Box>
        )}
      </Grid>

      {/* 3. MODAL DETAIL ANALYSIS */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedSession && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 1,
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Analysis Result
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSession.role} - {selectedSession.date}
                </Typography>
              </Box>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={4}>
                {/* Kolom Kiri: AI Summary & Feedback */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box
                    sx={{ bgcolor: "#f5f9ff", p: 2, borderRadius: 2, mb: 3 }}
                  >
                    <Stack direction="row" spacing={1} mb={1}>
                      <AutoAwesomeIcon color="primary" fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="primary"
                      >
                        AI Summary
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      "{selectedSession.details.summary}"
                    </Typography>
                  </Box>

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    Detailed Feedback
                  </Typography>
                  <Stack spacing={1.5}>
                    {selectedSession.details.feedback.map(
                      (fb: Feedback, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            alignItems: "flex-start",
                          }}
                        >
                          {fb.type === "positive" ? (
                            <CheckCircleIcon
                              color="success"
                              fontSize="small"
                              sx={{ mt: 0.3 }}
                            />
                          ) : (
                            <CancelIcon
                              color="error"
                              fontSize="small"
                              sx={{ mt: 0.3 }}
                            />
                          )}
                          <Typography variant="body2">{fb.text}</Typography>
                        </Box>
                      )
                    )}
                  </Stack>
                </Grid>

                {/* Kolom Kanan: Skill Breakdown */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 2 }}
                    >
                      Skill Breakdown
                    </Typography>
                    {selectedSession.details.skills.map(
                      (skill: Skill, index: number) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="caption" fontWeight="bold">
                              {skill.name}
                            </Typography>
                            <Typography variant="caption">
                              {skill.score}/100
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={skill.score}
                            sx={{
                              height: 6,
                              borderRadius: 5,
                              bgcolor: "#eee",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: getScoreColor(skill.score),
                              },
                            }}
                          />
                        </Box>
                      )
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleClose} sx={{ color: "text.secondary" }}>
                Close
              </Button>
              <Button variant="contained" onClick={handleClose} autoFocus>
                Download Report (PDF)
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default History;
