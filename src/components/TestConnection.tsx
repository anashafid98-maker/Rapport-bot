// src/components/TestConnection.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Database } from 'lucide-react';

export const TestConnection = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔗 Test de connexion Supabase...');
        console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
        
        // Test 1: Connexion basique
        const { data, error } = await supabase.from('profiles').select('count');
        
        if (error) throw error;
        
        setStatus('success');
        setMessage('✅ Connexion Supabase réussie !');
        console.log('✅ Connexion réussie');

        // Test 2: Voir les tables existantes
        const { data: profiles } = await supabase.from('profiles').select('*');
        const { data: reports } = await supabase.from('reports').select('*');
        
        console.log('👥 Profiles:', profiles);
        console.log('📊 Reports:', reports);

      } catch (err: any) {
        setStatus('error');
        setMessage(`❌ Erreur: ${err.message}`);
        console.error('💥 Erreur connexion:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Test Connexion Supabase</h3>
      </div>
      
      <div className={`flex items-center gap-3 p-3 rounded-lg ${
        status === 'success' ? 'bg-green-50 text-green-700' :
        status === 'error' ? 'bg-red-50 text-red-700' :
        'bg-blue-50 text-blue-700'
      }`}>
        {status === 'success' && <CheckCircle className="w-5 h-5" />}
        {status === 'error' && <XCircle className="w-5 h-5" />}
        {status === 'loading' && (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
        <span>{message || 'Test de connexion en cours...'}</span>
      </div>
    </div>
  );
};