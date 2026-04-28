// App.tsx
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Interview from "./pages/Interview";
import Sidebar from "./components/Sidebar";
import History from "./pages/History";
import InterviewCenter from "./pages/InterviewCenter";
import ProtectedRoute from "./components/ProtectedRoute";
import InterviewCenterDropdown from "./pages/InterviewCenterDropdown";
import InterviewResult from "./pages/InterviewResult";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Sidebar />}>
          <Route path="/interview" element={<Interview />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<h1>Settings Page</h1>} />
          <Route path="/interview-center" element={<InterviewCenter />} />
          <Route path="/position" element={<InterviewCenterDropdown />} />
          <Route path="/result" element={<InterviewResult />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
