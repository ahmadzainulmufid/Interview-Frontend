// pages/Interview.tsx
import { useState, useRef, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Typography,
  Button,
  Grid as Grid,
  Paper,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";

// --- IMPORT TENSORFLOW & MODEL ---
import "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import type { FaceLandmarksDetector } from "@tensorflow-models/face-landmarks-detection";

// Import Icons
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WifiIcon from "@mui/icons-material/Wifi";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SecurityIcon from "@mui/icons-material/Security";

const Interview = () => {
  // --- STATE BARU: SESSION STARTED ---
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  // --- STATE LAMA ---
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  // AI State
  const [model, setModel] = useState<FaceLandmarksDetector | null>(null);
  const [isDistracted, setIsDistracted] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const requestRef = useRef<number | null>(null);

  // 1. LOAD MODEL AI (Tetap jalan di awal agar ready saat user klik start)
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: "tfjs",
            refineLandmarks: true,
          }
        );
        setModel(loadedModel);
        setIsModelLoading(false);
        console.log("AI Model Loaded");
      } catch (err) {
        console.error("Gagal load model AI:", err);
      }
    };
    loadModel();
  }, []);

  // 2. DETEKSI GERAKAN WAJAH
  useEffect(() => {
    const detectFocus = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        model &&
        isCameraOn
      ) {
        const video = videoRef.current;
        try {
          const predictions = await model.estimateFaces(video);
          if (predictions.length > 0) {
            const keypoints = predictions[0].keypoints;
            const nose = keypoints[1];
            const leftEye = keypoints[33];
            const rightEye = keypoints[263];
            const faceWidth = rightEye.x - leftEye.x;
            const noseRelativePos = (nose.x - leftEye.x) / faceWidth;

            const isLookingLeft = noseRelativePos < 0.25;
            const isLookingRight = noseRelativePos > 0.75;

            if (isLookingLeft || isLookingRight) {
              setIsDistracted(true);
            } else {
              setIsDistracted(false);
            }
          } else {
            setIsDistracted(true);
          }
        } catch (error) {
          console.error("Detection error:", error);
        }
      }
      if (isCameraOn) {
        requestRef.current = requestAnimationFrame(detectFocus);
      }
    };

    if (isCameraOn && model) {
      detectFocus();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDistracted(false);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isCameraOn, model]);

  // --- FUNGSI KAMERA ---
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setIsCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      alert("Izin kamera ditolak.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraOn(false);
      setIsDistracted(false);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  // --- FUNGSI BARU: MULAI SESI ---
  const handleStartSession = () => {
    setIsSessionStarted(true);
    // Opsional: Langsung nyalakan kamera saat masuk room
    startCamera();
  };

  // =================================================================
  // TAMPILAN 1: LOBBY / PRE-INTERVIEW (Jika sesi belum mulai)
  // =================================================================
  if (!isSessionStarted) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <CssBaseline />
        <Paper
          elevation={10}
          sx={{
            maxWidth: 800,
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Bagian Kiri: Info & Rules */}
          <Box sx={{ p: 4, flex: 1.5 }}>
            <Typography variant="overline" color="primary" fontWeight="bold">
              AI Interview Session
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              Ready for your Frontend Developer Interview?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Before we begin, please review the following instructions to
              ensure the best experience with our AI interviewer.
            </Typography>

            <List>
              {[
                {
                  text: "Ensure you are in a quiet, well-lit environment.",
                  icon: <LightbulbIcon color="warning" />,
                },
                {
                  text: "Stable internet connection is required.",
                  icon: <WifiIcon color="primary" />,
                },
                {
                  text: "Your camera and microphone will be monitored.",
                  icon: <VideocamIcon color="action" />,
                },
                {
                  text: "AI will analyze your focus and expressions.",
                  icon: <SecurityIcon color="success" />,
                },
              ].map((item, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Bagian Kanan: Action & AI Status */}
          <Box
            sx={{
              bgcolor: "#f5f7fa",
              p: 4,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderLeft: { md: "1px solid #e0e0e0" },
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "white",
                color: "primary.main",
                mb: 2,
                boxShadow: 2,
              }}
            >
              <SmartToyIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              System Check
            </Typography>

            {/* Indikator Loading AI */}
            {isModelLoading ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 4 }}
              >
                <CircularProgress size={16} />
                <Typography variant="caption">Loading AI Model...</Typography>
              </Stack>
            ) : (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 4 }}
              >
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography
                  variant="caption"
                  color="success.main"
                  fontWeight="bold"
                >
                  AI Model Ready
                </Typography>
              </Stack>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={isModelLoading}
              onClick={handleStartSession}
              sx={{
                borderRadius: "30px",
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 8px 16px rgba(25, 118, 210, 0.2)",
              }}
            >
              {isModelLoading ? "Please Wait..." : "I'm Ready, Start Now"}
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, textAlign: "center" }}
            >
              By clicking Start, you agree to be recorded for analysis purposes.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  // =================================================================
  // TAMPILAN 2: ACTIVE SESSION (Kamera & AI)
  // =================================================================
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <CssBaseline />

      <Box sx={{ mb: 4, textAlign: "center", width: "100%" }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          AI Interview Session
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Posisi: Frontend Developer
        </Typography>
      </Box>

      {/* --- ALERT DISTRAKSI --- */}
      <Fade in={isDistracted && isCameraOn}>
        <Alert
          severity="error"
          variant="filled"
          icon={<WarningIcon fontSize="inherit" />}
          sx={{
            position: "fixed",
            top: 20,
            zIndex: 9999,
            width: "auto",
            fontWeight: "bold",
            boxShadow: 3,
          }}
        >
          PERINGATAN: Mohon tetap fokus melihat ke kamera!
        </Alert>
      </Fade>

      <Grid
        container
        spacing={4}
        maxWidth="lg"
        sx={{ height: "100%", width: "100%" }}
      >
        {/* === KIRI: USER CAMERA === */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={6}
            sx={{
              p: 2,
              height: "450px",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              bgcolor: "black",
              position: "relative",
              overflow: "hidden",
              border: isDistracted && isCameraOn ? "4px solid #f44336" : "none",
              transition: "border 0.3s ease",
            }}
          >
            <Chip
              label={
                isDistracted && isCameraOn ? "DISTRACTED!" : "You (Candidate)"
              }
              color={isDistracted && isCameraOn ? "error" : "primary"}
              size="small"
              sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
            />

            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                bgcolor: "#2c2c2c",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  display: isCameraOn ? "block" : "none",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                }}
              />

              {!isCameraOn && (
                <Box sx={{ textAlign: "center", color: "white" }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mb: 2,
                      mx: "auto",
                      bgcolor: "grey.700",
                    }}
                  >
                    <VideocamOffIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6">Camera is Off</Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2, borderRadius: 20 }}
                    onClick={startCamera}
                  >
                    Turn On Camera
                  </Button>
                </Box>
              )}
            </Box>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                p: 1,
                borderRadius: "30px",
              }}
            >
              <IconButton
                onClick={toggleMic}
                sx={{
                  bgcolor: isMicOn ? "white" : "error.main",
                  color: isMicOn ? "black" : "white",
                  "&:hover": { bgcolor: "grey.200" },
                }}
              >
                {isMicOn ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              <IconButton
                onClick={isCameraOn ? stopCamera : startCamera}
                sx={{
                  bgcolor: isCameraOn ? "white" : "error.main",
                  color: isCameraOn ? "black" : "white",
                  "&:hover": { bgcolor: "grey.200" },
                }}
              >
                {isCameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton
                // Opsi tambahan: Tombol end call bisa diarahkan untuk keluar sesi
                onClick={() => {
                  stopCamera();
                  setIsSessionStarted(false);
                }}
                sx={{
                  bgcolor: "error.main",
                  color: "white",
                  "&:hover": { bgcolor: "error.dark" },
                }}
              >
                <CallEndIcon />
              </IconButton>
            </Stack>
          </Paper>
        </Grid>

        {/* === KANAN: AI INTERVIEWER === */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={6}
            sx={{
              height: "450px",
              p: 3,
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#ffffff",
            }}
          >
            <Chip
              label="AI Interviewer"
              color="secondary"
              size="small"
              sx={{ alignSelf: "flex-start" }}
            />

            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -10,
                    left: -10,
                    right: -10,
                    bottom: -10,
                    borderRadius: "50%",
                    border: "2px solid #9c27b0",
                    animation: "pulse 2s infinite",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "secondary.main",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 60 }} />
                </Avatar>
              </Box>
              <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>
                Sarah (AI)
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <RecordVoiceOverIcon fontSize="small" /> Listening...
              </Typography>
            </Box>

            <Card
              sx={{
                width: "100%",
                bgcolor: "#f0f7ff",
                borderRadius: 3,
                border: "1px solid #bbdefb",
                mt: 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Current Question:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  "Tell me about a time you faced a challenging technical
                  problem and how you solved it?"
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(156, 39, 176, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(156, 39, 176, 0); }
        }
      `}</style>
    </Box>
  );
};

export default Interview;
