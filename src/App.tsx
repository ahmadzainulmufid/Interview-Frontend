import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Interview from "./pages/Interview";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Sidebar />}>
        <Route path="/interview" element={<Interview />} />

        {/* Nanti kamu buat halaman ini */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<h1>Settings Page</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
