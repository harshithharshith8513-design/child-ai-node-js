import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import IdGeneratorPage from './pages/IdGeneratorPage';

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-grow">
          <IdGeneratorPage />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
