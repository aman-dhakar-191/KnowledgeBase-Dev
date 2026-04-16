import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NotesList from './pages/NotesList';
import NoteView from './pages/NoteView';
import NewNote from './pages/NewNote';
import './App.css';

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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/notes" element={<NotesList />} />
                <Route path="/note/:id" element={<NoteView />} />
                <Route path="/new" element={<NewNote />} />
              </Routes>
            </main>
          </div>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
