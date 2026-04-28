import { useEffect, useRef } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { toast } from "react-toastify";

export const useFocusDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  isCameraOn: boolean,
) => {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastAlertTime = useRef<number>(0);

  // Fungsi untuk membatasi seberapa sering toast muncul (misal: tiap 5 detik)
  const showAlert = (message: string) => {
    const now = Date.now();
    if (now - lastAlertTime.current > 5000) {
      toast.warning(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      lastAlertTime.current = now;
    }
  };

  useEffect(() => {
    let active = true;

    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (active) {
          faceLandmarkerRef.current = landmarker;
        }
      } catch (error) {
        console.error("Gagal memuat MLKit/MediaPipe:", error);
      }
    };

    initializeFaceLandmarker();

    return () => {
      active = false;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const detectFace = () => {
      if (
        !videoRef.current ||
        !faceLandmarkerRef.current ||
        !isCameraOn ||
        videoRef.current.readyState < 2
      ) {
        requestRef.current = requestAnimationFrame(detectFace);
        return;
      }

      const video = videoRef.current;
      const startTimeMs = performance.now();

      const results = faceLandmarkerRef.current.detectForVideo(
        video,
        startTimeMs,
      );

      if (results.faceLandmarks.length === 0) {
        showAlert("Wajah tidak terdeteksi! Harap tetap di depan kamera.");
      } else {
        // Cek posisi hidung terhadap mata untuk deteksi menoleh
        const landmarks = results.faceLandmarks[0];
        const noseTip = landmarks[1]; // Titik hidung
        const leftEye = landmarks[33]; // Titik mata kiri
        const rightEye = landmarks[263]; // Titik mata kanan

        // Logika sederhana: jika hidung terlalu condong melewati batas mata
        const isLookingAway =
          noseTip.x < Math.min(leftEye.x, rightEye.x) ||
          noseTip.x > Math.max(leftEye.x, rightEye.x);

        if (isLookingAway) {
          showAlert("Harap fokus menatap layar saat wawancara!");
        }
      }

      requestRef.current = requestAnimationFrame(detectFace);
    };

    if (isCameraOn) {
      requestRef.current = requestAnimationFrame(detectFace);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isCameraOn, videoRef]);
};
