import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Loader2, Eye, EyeOff, Building2, ShieldCheck } from 'lucide-react';

export const SignupForm = ({ onToggle }: { onToggle: () => void }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [zone, setZone] = useState<'OSBL-SAP' | 'DAP' | 'PAP'>('OSBL-SAP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUp(email, password, fullName, zone);
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess('Compte créé avec succès ! Redirection vers la connexion...');
        setTimeout(() => {
          onToggle();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <Building2 className="w-8 h-8 text-white/90" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Maintenance Pro</h1>
          <p className="text-emerald-100 font-light">Création de compte professionnel</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                placeholder="Jean Dupont"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Adresse email professionnelle
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                placeholder="votre@entreprise.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm pr-12"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Zone assignée
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as 'OSBL-SAP' | 'DAP' | 'PAP')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                required
                disabled={loading}
              >
                <option value="OSBL-SAP" className="bg-gray-800">OSBL-SAP</option>
                <option value="DAP" className="bg-gray-800">DAP</option>
                <option value="PAP" className="bg-gray-800">PAP</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Création du compte...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Créer mon compte</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Déjà un compte professionnel ?
              </p>
              <button
                onClick={onToggle}
                disabled={loading}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-200 hover:underline disabled:opacity-50"
              >
                Se connecter à mon compte
              </button>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-3 h-3" />
            <span>Inscription sécurisée • Données cryptées</span>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400 rounded-full opacity-60 animate-bounce" />
      <div className="absolute top-20 right-20 w-1 h-1 bg-teal-400 rounded-full opacity-40 animate-bounce delay-300" />
      <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-green-400 rounded-full opacity-50 animate-bounce delay-700" />
    </div>
  );
};