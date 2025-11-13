import { jsPDF } from "jspdf";
import { Report } from "../types";

export async function generateProfessionalPDF(report: Report) {
  try {
    const { zone, report_data } = report;
    const doc = new jsPDF();

    const primaryColor: [number, number, number] = [52, 73, 94];
    const accentColor: [number, number, number] = [52, 152, 219];
    const textColor: [number, number, number] = [44, 62, 80];
    const lightGray: [number, number, number] = [236, 240, 241];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE MAINTENANCE', 105, 15, { align: 'center' });

    doc.setFontSize(16);
    doc.text(`RAPPORT D'INTERVENTION - ZONE ${zone}`, 105, 25, { align: 'center' });

    let yPos = 45;

    yPos = addSection(doc, yPos, "INFORMATIONS GÉNÉRALES", [
      { label: "Date", value: report_data.date || "Non spécifiée" },
      { label: "Équipe", value: report_data.shift || "Non spécifiée" },
      { label: "Technicien", value: report_data.technician || "Non spécifié" }
    ]);

    yPos = addSection(doc, yPos, "INFORMATIONS ÉQUIPEMENT", [
      { label: "ID Équipement", value: report_data.equipment_id || "Non spécifié" },
      { label: "Nom Équipement", value: report_data.equipment_name || "Non spécifié" },
      { label: "Localisation", value: report_data.equipment_location || "Non spécifiée" }
    ]);

    yPos = addSection(doc, yPos, "DÉTAILS INTERVENTION", [
      { label: "Type de Maintenance", value: report_data.maintenance_type || "Non spécifié" },
      { label: "Statut", value: report_data.status || "Non spécifié" }
    ]);

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addTextSection(doc, yPos, "Description des Travaux",
      report_data.work_description || "Aucune description fournie");

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSectionTitle(doc, yPos, "OBSERVATIONS");

    yPos = addTextSection(doc, yPos, "Anomalies Détectées",
      report_data.anomalies_detected || "Aucune anomalie détectée");

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addTextSection(doc, yPos, "Actions Correctives",
      report_data.corrective_actions || "Aucune action corrective");

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSectionTitle(doc, yPos, "RESSOURCES UTILISÉES");

    yPos = addTextSection(doc, yPos, "Pièces Utilisées",
      report_data.parts_used || "Aucune pièce utilisée");

    yPos = addTextSection(doc, yPos, "Outils Utilisés",
      report_data.tools_used || "Aucun outil utilisé");

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSection(doc, yPos, "TEMPS D'INTERVENTION", [
      { label: "Heure Début", value: report_data.start_time || "Non spécifiée" },
      { label: "Heure Fin", value: report_data.end_time || "Non spécifiée" },
      { label: "Total Heures", value: report_data.total_hours || "Non spécifié" }
    ]);

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSection(doc, yPos, "VÉRIFICATIONS", [
      {
        label: "Vérification Sécurité",
        value: report_data.safety_check ? "✓ COMPLÉTÉ" : "✗ NON COMPLÉTÉ"
      },
      {
        label: "Nettoyage Effectué",
        value: report_data.cleanliness_check ? "✓ COMPLÉTÉ" : "✗ NON COMPLÉTÉ"
      },
      {
        label: "Tests Fonctionnels",
        value: report_data.testing_check ? "✓ COMPLÉTÉ" : "✗ NON COMPLÉTÉ"
      },
      {
        label: "Documentation Mise à Jour",
        value: report_data.documentation_check ? "✓ COMPLÉTÉ" : "✗ NON COMPLÉTÉ"
      }
    ]);

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos = addSection(doc, yPos, "NOTES ADDITIONNELLES", [
      { label: "Prochaine Maintenance", value: report_data.next_maintenance || "Non planifiée" }
    ]);

    yPos = addTextSection(doc, yPos, "Notes",
      report_data.notes || "Aucune note");

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 10;
    doc.setTextColor(127, 140, 141);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text("Technicien: _________________________", 20, yPos);
    doc.text("Superviseur: _________________________", 120, yPos);

    yPos += 15;
    doc.setFontSize(8);
    doc.setTextColor(149, 165, 166);
    const footerText = `Document généré le ${new Date().toLocaleDateString('fr-FR')} - Système de Gestion de Maintenance`;
    doc.text(footerText, 105, yPos, { align: 'center' });

    const fileName = `Rapport_Maintenance_${zone}_${report_data.equipment_id || 'SansReference'}_${report_data.date || new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    throw error;
  }
}

function addSectionTitle(doc: jsPDF, yPos: number, title: string): number {
  doc.setFillColor(52, 152, 219);
  doc.rect(15, yPos, 180, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPos + 5.5);

  return yPos + 12;
}

function addSection(doc: jsPDF, yPos: number, title: string, items: Array<{label: string, value: any}>): number {
  yPos = addSectionTitle(doc, yPos, title);

  doc.setTextColor(44, 62, 80);
  doc.setFontSize(10);

  items.forEach((item, index) => {
    const bgColor: [number, number, number] = index % 2 === 0 ? [248, 249, 250] : [236, 240, 241];
    doc.setFillColor(...bgColor);
    doc.rect(15, yPos, 180, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text(item.label + ':', 20, yPos + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(String(item.value), 80, yPos + 5);

    yPos += 7;
  });

  return yPos + 5;
}

function addTextSection(doc: jsPDF, yPos: number, label: string, value: string): number {
  doc.setFillColor(236, 240, 241);
  doc.rect(15, yPos, 180, 7, 'F');

  doc.setTextColor(44, 62, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(label + ':', 20, yPos + 5);

  yPos += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const splitText = doc.splitTextToSize(value, 170);

  splitText.forEach((line: string) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 20, yPos);
    yPos += 5;
  });

  return yPos + 5;
}
