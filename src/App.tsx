import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { ReportForm } from './components/Reports/ReportForm';
import { ReportsList } from './components/Reports/ReportsList';
import { LogOut, FileText, List, Plus, Settings, User, Building2, Shield } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [view, setView] = useState<'create' | 'list'>('list');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative text-center">
          <div className="w-20 h-20 border-4 border-blue-500/50 border-t-blue-400 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Chargement</h2>
          <p className="text-blue-200">Initialisation de la plateforme...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginForm onToggle={() => setAuthMode('signup')} />
    ) : (
      <SignupForm onToggle={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo and User Info */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Maintenance Pro
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{profile?.full_name || user.email}</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">Zone: {profile?.zone || 'Non assigné'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center gap-3">
              {/* Create Report Button */}
              <button
                onClick={() => setView('create')}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg ${
                  view === 'create'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/25'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl border border-gray-200'
                } hover:scale-105 active:scale-95`}
              >
                <Plus className="w-5 h-5" />
                Nouveau Rapport
              </button>

              {/* Reports List Button */}
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg ${
                  view === 'list'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/25'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl border border-gray-200'
                } hover:scale-105 active:scale-95`}
              >
                <List className="w-5 h-5" />
                Mes Rapports
              </button>

              {/* Logout Button */}
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'create' ? (
          profile?.zone ? (
            <div className="animate-fade-in">
              <ReportForm
                zone={profile.zone}
                onReportSaved={() => {
                  setView('list');
                  // Optional: Add a success notification here
                }}
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-2xl p-12 text-center border border-amber-200">
              <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-300">
                <Settings className="w-12 h-12 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-amber-900 mb-4">Zone Non Assignée</h2>
              <p className="text-amber-700 text-lg max-w-md mx-auto mb-6">
                Votre compte n'est actuellement associé à aucune zone de maintenance.
              </p>
              <div className="bg-white/50 rounded-2xl p-6 max-w-md mx-auto border border-amber-200">
                <div className="flex items-center gap-3 text-amber-800 mb-4">
                  <Shield className="w-6 h-6" />
                  <span className="font-semibold">Action Requise</span>
                </div>
                <p className="text-amber-700">
                  Veuillez contacter l'administrateur système pour qu'il vous assigne une zone de maintenance.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="animate-fade-in">
            <ReportsList />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-600">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Plateforme Sécurisée • Maintenance Pro v1.0</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 Maintenance Pro. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Background Elements */}
      <div className="fixed top-10 left-10 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-bounce pointer-events-none" />
      <div className="fixed top-20 right-20 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-bounce delay-300 pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-50 animate-bounce delay-700 pointer-events-none" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;