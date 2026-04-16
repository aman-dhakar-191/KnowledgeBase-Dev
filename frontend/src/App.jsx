import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotesList = lazy(() => import('./pages/NotesList'));
const NoteView = lazy(() => import('./pages/NoteView'));
const NewNote = lazy(() => import('./pages/NewNote'));

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <AppProvider>
        <div className="app">
          <Header onMenuClick={() => setSidebarOpen((v) => !v)} />
          <div className="app__body">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="app__main">
              <Suspense fallback={<LoadingSpinner message="Loading..." />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/notes" element={<NotesList />} />
                  <Route path="/note/:id" element={<NoteView />} />
                  <Route path="/new" element={<NewNote />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
