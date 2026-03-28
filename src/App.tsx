import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-stone-100">
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-stone-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:eventId" element={<EventDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
