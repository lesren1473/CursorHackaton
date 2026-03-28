import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { EventDetailPage } from './pages/EventDetailPage';

function App() {
  return (
    <div className="min-h-dvh bg-stone-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:eventId" element={<EventDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
