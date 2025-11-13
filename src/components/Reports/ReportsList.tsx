import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Loader2, Trash2, Download, Calendar,
  User, Settings, FileText, BarChart3,
  Shield, Building2, Filter, Search,
  Eye, DownloadCloud
} from "lucide-react";
import { generateProfessionalExcel } from "../../utils/excelGenerator";
import { generateProfessionalPDF } from "../../utils/pdfGenerator";
import { DeleteModal } from "../DeleteModal";
import { Report, Profile } from "../../types";

export const ReportsList = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [generatingExcelId, setGeneratingExcelId] = useState<string | null>(null);
  const [generatingPDFId, setGeneratingPDFId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; report: Report | null }>({
    isOpen: false,
    report: null
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadReports = async () => {
    setLoading(true);
    let query = supabase
      .from("reports")
      .select("*");

    if (filterZone !== 'all') {
      query = query.eq('zone', filterZone);
    }
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement rapports :", error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Erreur récupération utilisateur :", userError);
        return;
      }

      if (user?.email === "hafid.anas.ah@gmail.com") {
        setIsAdmin(true);
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (usersError) console.error("Erreur chargement utilisateurs :", usersError);
        else setUsers(usersData || []);
      }
    };

    loadReports();
    checkAdminAndLoadUsers();
  }, [filterZone, filterStatus]);

  const filteredReports = reports.filter(report => 
    report.report_data.technician?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_data.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_data.equipment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadProfessionalExcel = async (report: Report) => {
    try {
      setGeneratingExcelId(report.id);
      await generateProfessionalExcel(report);
    } catch (err) {
      console.error("Erreur génération Excel :", err);
      alert("Erreur lors de la génération du rapport Excel !");
    } finally {
      setGeneratingExcelId(null);
    }
  };

  const handleDownloadProfessionalPDF = async (report: Report) => {
    try {
      setGeneratingPDFId(report.id);
      await generateProfessionalPDF(report);
    } catch (err) {
      console.error("Erreur génération PDF :", err);
      alert("Erreur lors de la génération du rapport PDF !");
    } finally {
      setGeneratingPDFId(null);
    }
  };

  const openDeleteModal = (report: Report) => setDeleteModal({ isOpen: true, report });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, report: null });

  const handleDeleteReport = async () => {
    if (!deleteModal.report) return;
    const reportToDelete = deleteModal.report;
    try {
      setDeletingId(reportToDelete.id);
      const { error } = await supabase.from("reports").delete().eq("id", reportToDelete.id);
      if (error) throw error;
      setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      closeDeleteModal();
    } catch (error) {
      console.error("Erreur suppression rapport:", error);
      alert("Erreur lors de la suppression du rapport");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusCounts = () => {
    const completed = reports.filter(r => r.status === 'completed').length;
    const draft = reports.filter(r => r.status === 'draft').length;
    return { completed, draft, total: reports.length };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAdmin && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
              <p className="text-gray-600">Liste complète des techniciens enregistrés</p>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <th className="p-6 text-left font-semibold text-gray-700">Email</th>
                    <th className="p-6 text-left font-semibold text-gray-700">Nom</th>
                    <th className="p-6 text-left font-semibold text-gray-700">Zone</th>
                    <th className="p-6 text-left font-semibold text-gray-700">Date d'inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-all">
                      <td className="p-6 text-gray-900">{u.email}</td>
                      <td className="p-6 text-gray-900 font-medium">{u.full_name || '-'}</td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          u.zone === "OSBL-SAP" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                          u.zone === "DAP" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                          u.zone === "PAP" ? "bg-orange-100 text-orange-800 border border-orange-200" :
                          "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}>
                          {u.zone || 'Non assigné'}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600">
                        {new Date(u.created_at).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Rapports de Maintenance</h1>
            <p className="text-gray-600 text-lg">Gérez et consultez tous vos rapports d'intervention</p>
          </div>
          <div className="flex items-center gap-6 mt-6 lg:mt-0">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{statusCounts.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 text-center">
              <div className="text-2xl font-bold text-emerald-700">{statusCounts.completed}</div>
              <div className="text-sm text-emerald-600">Terminés</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-center">
              <div className="text-2xl font-bold text-amber-700">{statusCounts.draft}</div>
              <div className="text-sm text-amber-600">Brouillons</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par technicien, équipement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select 
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">Toutes les zones</option>
              <option value="OSBL-SAP">OSBL-SAP</option>
              <option value="DAP">DAP</option>
              <option value="PAP">PAP</option>
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Terminé</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun rapport trouvé</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || filterZone !== 'all' || filterStatus !== 'all' 
                ? "Aucun rapport ne correspond aux critères de recherche."
                : "Créez votre premier rapport de maintenance pour commencer à suivre vos interventions."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <th className="p-6 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>Date</span>
                    </div>
                  </th>
                  <th className="p-6 text-left font-semibold text-gray-700">Zone</th>
                  <th className="p-6 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-green-600" />
                      <span>Technicien</span>
                    </div>
                  </th>
                  <th className="p-6 text-left font-semibold text-gray-700">Type</th>
                  <th className="p-6 text-left font-semibold text-gray-700">Statut</th>
                  <th className="p-6 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200 group">
                    <td className="p-6">
                      <div className="font-semibold text-gray-900">{report.report_data.date}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(report.created_at).toLocaleDateString("fr-FR", {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
                        report.zone === "OSBL-SAP" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        report.zone === "DAP" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        "bg-orange-100 text-orange-800 border-orange-200"
                      }`}>
                        {report.zone}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="font-medium text-gray-900">{report.report_data.technician}</div>
                      <div className="text-sm text-gray-500">{report.report_data.shift}</div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                        report.report_data.maintenance_type === "Préventive" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        report.report_data.maintenance_type === "Corrective" ? "bg-amber-100 text-amber-800 border-amber-200" :
                        report.report_data.maintenance_type === "Curative" ? "bg-red-100 text-red-800 border-red-200" :
                        "bg-cyan-100 text-cyan-800 border-cyan-200"
                      }`}>
                        {report.report_data.maintenance_type}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                        report.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
                        report.status === "draft" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                        "bg-gray-100 text-gray-800 border-gray-200"
                      }`}>
                        {report.status === "completed" ? "Terminé" :
                         report.status === "draft" ? "Brouillon" : report.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownloadProfessionalExcel(report)}
                          disabled={generatingExcelId === report.id}
                          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
                          title="Télécharger en Excel"
                        >
                          {generatingExcelId === report.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <DownloadCloud className="w-4 h-4" />
                          )}
                          <span className="font-medium">Excel</span>
                        </button>

                        <button
                          onClick={() => handleDownloadProfessionalPDF(report)}
                          disabled={generatingPDFId === report.id}
                          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
                          title="Télécharger en PDF"
                        >
                          {generatingPDFId === report.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          <span className="font-medium">PDF</span>
                        </button>

                        <button
                          onClick={() => openDeleteModal(report)}
                          disabled={deletingId === report.id}
                          className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
                          title="Supprimer le rapport"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="font-medium">Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteReport}
        report={deleteModal.report}
        isLoading={deletingId === deleteModal.report?.id}
      />
    </>
  );
};