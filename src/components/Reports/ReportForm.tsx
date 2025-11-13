import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Save, Send, Clock, Wrench, AlertTriangle, CheckCircle, Building2, User, Calendar } from 'lucide-react';

type ReportFormProps = {
  zone: 'OSBL-SAP' | 'DAP' | 'PAP';
  onReportSaved: () => void;
};

export const ReportForm = ({ zone, onReportSaved }: ReportFormProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'Matin',
    technician: profile?.full_name || '',
    equipment_id: '',
    equipment_name: '',
    equipment_location: '',
    maintenance_type: 'Préventive',
    work_description: '',
    anomalies_detected: '',
    corrective_actions: '',
    parts_used: '',
    tools_used: '',
    start_time: '',
    end_time: '',
    total_hours: '',
    safety_check: false,
    cleanliness_check: false,
    testing_check: false,
    documentation_check: false,
    status: 'Terminé',
    notes: '',
    next_maintenance: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (status: 'draft' | 'completed') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: saveError } = await supabase
        .from('reports')
        .insert({
          user_id: profile?.id,
          zone: zone,
          report_data: formData,
          status: status,
        });

      if (saveError) throw saveError;

      setSuccess(status === 'draft' ? 'Brouillon sauvegardé avec succès !' : 'Rapport finalisé et enregistré !');
      setTimeout(() => {
        onReportSaved();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du rapport');
    } finally {
      setLoading(false);
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'OSBL-SAP': return 'from-emerald-500 to-green-600';
      case 'DAP': return 'from-blue-500 to-cyan-600';
      case 'PAP': return 'from-orange-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`bg-gradient-to-r ${getZoneColor(zone)} p-4 rounded-2xl shadow-lg`}>
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Nouveau Rapport de Maintenance
          </h2>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              zone === 'OSBL-SAP' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              zone === 'DAP' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
              'bg-orange-100 text-orange-800 border border-orange-200'
            }`}>
              Zone {zone}
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      <form className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            Informations Générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date d'intervention</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Équipe</label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Matin">Matin</option>
                <option value="Après-midi">Après-midi</option>
                <option value="Nuit">Nuit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technicien</label>
              <input
                type="text"
                name="technician"
                value={formData.technician}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Equipment Information */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
            <Wrench className="w-5 h-5 text-emerald-600" />
            Informations Équipement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Équipement</label>
              <input
                type="text"
                name="equipment_id"
                value={formData.equipment_id}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="EQ-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom Équipement</label>
              <input
                type="text"
                name="equipment_name"
                value={formData.equipment_name}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="Pompe centrifuge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
              <input
                type="text"
                name="equipment_location"
                value={formData.equipment_location}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="Bâtiment A, Niveau 2"
              />
            </div>
          </div>
        </div>

        {/* Intervention Details */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Détails Intervention</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de Maintenance</label>
              <select
                name="maintenance_type"
                value={formData.maintenance_type}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Préventive">Préventive</option>
                <option value="Corrective">Corrective</option>
                <option value="Curative">Curative</option>
                <option value="Amélioration">Amélioration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="Terminé">Terminé</option>
                <option value="En cours">En cours</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description des Travaux</label>
            <textarea
              name="work_description"
              value={formData.work_description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Décrivez en détail les travaux effectués..."
            />
          </div>
        </div>

        {/* Observations */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Observations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anomalies Détectées</label>
              <textarea
                name="anomalies_detected"
                value={formData.anomalies_detected}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Décrivez les anomalies observées..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions Correctives</label>
              <textarea
                name="corrective_actions"
                value={formData.corrective_actions}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Décrivez les actions correctives mises en œuvre..."
              />
            </div>
          </div>
        </div>

        {/* Resources Used */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ressources Utilisées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pièces Utilisées</label>
              <textarea
                name="parts_used"
                value={formData.parts_used}
                onChange={handleChange}
                rows={2}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                placeholder="Listez les pièces de rechange utilisées..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Outils Utilisés</label>
              <textarea
                name="tools_used"
                value={formData.tools_used}
                onChange={handleChange}
                rows={2}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                placeholder="Listez les outils et équipements utilisés..."
              />
            </div>
          </div>
        </div>

        {/* Time Tracking */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Temps d'Intervention</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure Début</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure Fin</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Heures</label>
              <input
                type="text"
                name="total_hours"
                value={formData.total_hours}
                onChange={handleChange}
                placeholder="Ex: 2.5"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Verifications */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vérifications Finales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
              <input
                type="checkbox"
                name="safety_check"
                checked={formData.safety_check}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <span className="text-gray-900 font-medium">Vérification Sécurité</span>
                <p className="text-gray-600 text-sm mt-1">Toutes les mesures de sécurité respectées</p>
              </div>
            </label>
            <label className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
              <input
                type="checkbox"
                name="cleanliness_check"
                checked={formData.cleanliness_check}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <span className="text-gray-900 font-medium">Nettoyage Effectué</span>
                <p className="text-gray-600 text-sm mt-1">Zone de travail nettoyée et rangée</p>
              </div>
            </label>
            <label className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
              <input
                type="checkbox"
                name="testing_check"
                checked={formData.testing_check}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <span className="text-gray-900 font-medium">Tests Fonctionnels</span>
                <p className="text-gray-600 text-sm mt-1">Tests de fonctionnement validés</p>
              </div>
            </label>
            <label className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
              <input
                type="checkbox"
                name="documentation_check"
                checked={formData.documentation_check}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
              <div>
                <span className="text-gray-900 font-medium">Documentation Mise à Jour</span>
                <p className="text-gray-600 text-sm mt-1">Fiche d'intervention complétée</p>
              </div>
            </label>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Notes Additionnelles</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Recommandations</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Notes additionnelles, recommandations pour les prochaines interventions..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prochaine Maintenance Prévue</label>
              <input
                type="date"
                name="next_maintenance"
                value={formData.next_maintenance}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder Brouillon'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('completed')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Finalisation...' : 'Finaliser le Rapport'}
          </button>
        </div>
      </form>
    </div>
  );
};