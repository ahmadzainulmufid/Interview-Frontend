import { useState, useRef, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Icons
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import TimerIcon from "@mui/icons-material/Timer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const API_BASE = "http://localhost:5001";

interface ChatMessage {
  // Tambahkan "System" di sini untuk menampung Technical Gap
  sender: "AI" | "User" | "System";
  text: string;
}

// ==========================================
// KOMPONEN TYPEWRITER UNTUK AI
// ==========================================
const TypewriterText = ({
  text,
  speed = 30,
}: {
  text: string;
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(intervalId);
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return <Typography variant="body2">{displayedText}</Typography>;
};

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { roleName, levelName } = location.state || {
    roleName: "Backend Engineer",
    levelName: "Junior",
  };

  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [aiState, setAiState] = useState<
    "idle" | "thinking" | "speaking" | "listening"
  >("idle");
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);

  const [liveUserText, setLiveUserText] = useState("");
  const finalTranscriptRef = useRef("");

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasStarted = useRef(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUsername(JSON.parse(storedUser).username);
    }

    // SETUP WEB SPEECH API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "id-ID";

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setLiveUserText(finalTranscriptRef.current + interimTranscript);
      };
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      mulaiSesiAPI();
      startCamera();
    }

    return () => {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, liveUserText]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const mulaiSesiAPI = async () => {
    setAiState("thinking");
    try {
      const response = await axios.post(`${API_BASE}/start`, {
        role: roleName,
        level: levelName,
      });

      if (response.data.success) {
        const data = response.data.data;
        setSessionId(data.session_id);
        setTranscript([{ sender: "AI", text: data.question }]);
        playAiAudio(data.audio_url);
      }
    } catch (error) {
      console.error("Gagal memulai sesi", error);
      setAiState("idle");
    }
  };

  const playAiAudio = (audioPath: string) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setAiState("speaking");
    const audio = new Audio(`${API_BASE}${audioPath}`);
    currentAudioRef.current = audio;

    audio.onended = () => {
      setAiState("listening");
    };
    audio.play().catch(() => setAiState("listening"));
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingAnswer();
    } else {
      startRecordingAnswer();
    }
  };

  const startRecordingAnswer = () => {
    if (!streamRef.current) return;
    const audioStream = new MediaStream(streamRef.current.getAudioTracks());

    try {
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = sendAudioToAPI;
      mediaRecorder.start();
      setIsRecording(true);

      setLiveUserText("");
      finalTranscriptRef.current = "";
      if (recognitionRef.current) recognitionRef.current.start();
    } catch (e) {
      console.error("MediaRecorder Error:", e);
    }
  };

  const stopRecordingAnswer = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAiState("thinking");

      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const sendAudioToAPI = async () => {
    if (!sessionId) return;

    const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

    if (audioBlob.size < 1000) {
      setAiState("listening");
      setLiveUserText("");
      finalTranscriptRef.current = "";
      alert("Suara tidak terdengar atau terlalu singkat. Silakan coba lagi.");
      return;
    }

    const formData = new FormData();
    formData.append("session_id", sessionId.toString());
    formData.append("audio", audioBlob, "answer.webm");

    try {
      const response = await axios.post(`${API_BASE}/answer/audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        let finalTranscript = response.data.transcript.trim();

        const hallucinationWords = [
          "terima kasih.",
          "terima kasih",
          "terimakasih.",
          "subtitles by",
        ];
        if (
          hallucinationWords.some((word) =>
            finalTranscript.toLowerCase().includes(word),
          )
        ) {
          finalTranscript = liveUserText || "Jawaban kurang jelas.";
        }

        const responseData = response.data.data;

        // 1. TAMBAHKAN JAWABAN USER KE TRANSKRIP SAJA (Tanpa pesan System/Evaluasi)
        setTranscript((prev) => [
          ...prev,
          { sender: "User", text: finalTranscript },
        ]);
        setLiveUserText("");
        finalTranscriptRef.current = "";

        // 2. CEK JIKA WAWANCARA SELESAI
        if (responseData.stage === "Completed") {
          setTranscript((prev) => [
            ...prev,
            {
              sender: "AI",
              text: "Terima kasih, wawancara telah selesai. Kami akan memproses laporan Anda.",
            },
          ]);
          setAiState("idle");

          // Pindah ke halaman Result hanya dengan membawa Session ID
          setTimeout(() => {
            navigate("/result", { state: { sessionId: sessionId } });
          }, 2000);
          return;
        }

        // Lanjut ke pertanyaan berikutnya
        setTranscript((prev) => [
          ...prev,
          { sender: "AI", text: responseData.next_question },
        ]);
        playAiAudio(responseData.audio_url);
      }
    } catch (error) {
      setAiState("listening");
      setLiveUserText("");
      finalTranscriptRef.current = "";
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setIsCameraOn(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      alert("Izin kamera/mikrofon ditolak");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOn(false);
  };

  const renderAiStatus = () => {
    switch (aiState) {
      case "thinking":
        return (
          <>
            <MoreHorizIcon fontSize="small" /> Thinking...
          </>
        );
      case "speaking":
        return (
          <>
            <VolumeUpIcon fontSize="small" /> Speaking...
          </>
        );
      case "listening":
        return (
          <>
            <RecordVoiceOverIcon fontSize="small" /> Listening...
          </>
        );
      default:
        return "Idle";
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
        p: { xs: 2, md: 3 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* HEADER */}
      <Box
        sx={{
          mb: 2,
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Box sx={{ flex: 1 }} />
        <Typography
          variant="h4"
          fontWeight="bold"
          color="primary"
          sx={{ flex: 1, textAlign: "center" }}
        >
          Sesi Wawancara
        </Typography>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Paper
            elevation={2}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: timeLeft <= 60 ? "#ffebee" : "#ffffff",
              border: "2px solid",
              borderColor: timeLeft <= 60 ? "error.main" : "#e0e0e0",
              color: timeLeft <= 60 ? "error.main" : "text.primary",
            }}
          >
            <TimerIcon color={timeLeft <= 60 ? "error" : "action"} />
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ fontFamily: "monospace" }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          maxWidth: "1100px",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* TOP ROW: KAMERA & AI */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            width: "100%",
            flex: 1,
            minHeight: 0,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 1,
              flex: 1.4,
              height: "100%",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              bgcolor: "black",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Chip
              label={`${username} (Interviewee)`}
              color="primary"
              size="small"
              sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
            />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "12px",
                overflow: "hidden",
                bgcolor: "#2c2c2c",
                position: "relative",
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
                      width: 70,
                      height: 70,
                      mb: 1.5,
                      mx: "auto",
                      bgcolor: "grey.700",
                    }}
                  >
                    <VideocamOffIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="subtitle1">Kamera Dimatikan</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1.5 }}
                    onClick={startCamera}
                  >
                    Nyalakan Kamera
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>

          <Paper
            elevation={6}
            sx={{
              flex: 1,
              height: "100%",
              p: 2,
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#ffffff",
              position: "relative",
            }}
          >
            <Chip
              label="AI Interviewer"
              color="secondary"
              size="small"
              sx={{ position: "absolute", top: 16, left: 16 }}
            />
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor:
                    aiState === "listening" ? "success.main" : "secondary.main",
                  mx: "auto",
                  transition: "0.3s",
                }}
              >
                <SmartToyIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                Sarah (AI)
              </Typography>
              <Typography
                variant="body2"
                color={
                  aiState === "listening" ? "success.main" : "secondary.main"
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mt: 1,
                }}
              >
                {renderAiStatus()}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* BOTTOM ROW: TRANSCRIPT DINAMIS */}
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            height: "220px",
            flexShrink: 0,
            p: 2,
            borderRadius: "20px",
            bgcolor: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box ref={transcriptRef} sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
            {transcript.map((chat, index) => (
              <Box
                key={index}
                sx={{
                  mb: 1.5,
                  display: "flex",
                  flexDirection: chat.sender === "User" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color={
                    chat.sender === "AI" ? "secondary.main" : "primary.main"
                  }
                  sx={{ mt: 1, whiteSpace: "nowrap" }}
                >
                  {chat.sender === "AI" ? "Sarah (AI)" : username}
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: chat.sender === "AI" ? "#f3e5f5" : "#e3f2fd",
                    color: "text.primary",
                    maxWidth: "75%",
                    textAlign: "left",
                  }}
                >
                  {chat.sender === "AI" && index === transcript.length - 1 ? (
                    <TypewriterText text={chat.text} speed={40} />
                  ) : (
                    <Typography variant="body2">{chat.text}</Typography>
                  )}
                </Box>
              </Box>
            ))}

            {isRecording && liveUserText && (
              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  flexDirection: "row-reverse",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ mt: 1, whiteSpace: "nowrap" }}
                >
                  {username}
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: "#e3f2fd",
                    color: "text.secondary",
                    fontStyle: "italic",
                    maxWidth: "75%",
                    textAlign: "left",
                  }}
                >
                  <Typography variant="body2">{liveUserText}...</Typography>
                </Box>
              </Box>
            )}

            {aiState === "thinking" && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic", ml: 8 }}
              >
                AI sedang mencerna jawaban...
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      {/* CONTROL BAR */}
      <Paper
        elevation={6}
        sx={{
          mt: 2,
          p: 1,
          px: 3,
          borderRadius: "40px",
          display: "flex",
          gap: 2,
          alignItems: "center",
          bgcolor: "white",
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={toggleRecording}
          disabled={aiState !== "listening" || !isCameraOn}
          sx={{
            bgcolor: isRecording
              ? "error.main"
              : aiState === "listening"
                ? "success.light"
                : "grey.200",
            color:
              isRecording || aiState === "listening" ? "white" : "grey.500",
            "&:hover": { bgcolor: isRecording ? "error.dark" : "success.main" },
            transition: "0.2s",
          }}
          title="Klik untuk merekam"
        >
          {isRecording ? <MicIcon /> : <MicOffIcon />}
        </IconButton>

        {aiState === "listening" && !isRecording && (
          <Typography variant="caption" color="success.main" fontWeight="bold">
            Klik ikon Mic untuk menjawab
          </Typography>
        )}
        {isRecording && (
          <Typography variant="caption" color="error.main" fontWeight="bold">
            Merekam... Klik kembali untuk mengirim
          </Typography>
        )}

        <IconButton
          onClick={isCameraOn ? stopCamera : startCamera}
          sx={{
            bgcolor: isCameraOn ? "grey.200" : "error.main",
            color: isCameraOn ? "black" : "white",
            "&:hover": { bgcolor: isCameraOn ? "grey.300" : "error.dark" },
          }}
        >
          {isCameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Button
          variant="contained"
          color="error"
          startIcon={<CallEndIcon />}
          sx={{ borderRadius: "20px", px: 3, py: 1, fontWeight: "bold" }}
          onClick={() => {
            stopCamera();
            navigate("/result", {
              state: { sessionId: sessionId, transcriptHistory: transcript },
            });
          }}
        >
          AKHIRI WAWANCARA
        </Button>
      </Paper>
    </Box>
  );
};

export default Interview;
