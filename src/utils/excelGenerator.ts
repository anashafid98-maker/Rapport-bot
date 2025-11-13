import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Report } from "../types";

export async function generateProfessionalExcel(report: Report) {
  try {
    const { zone, report_data } = report;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Rapport ${zone}`);

    worksheet.properties.defaultRowHeight = 25;

    worksheet.columns = [
      { width: 33 },
      { width: 30 },
      { width: 40 },
      { width: 30 },
      { width: 40 },
      { width: 5 }
    ];

    const companyRow = worksheet.addRow(["", " SERVICE MAINTENANCE", "", "", "", ""]);
    const titleRow = worksheet.addRow(["", `RAPPORT D'INTERVENTION - ZONE ${zone}`, "", "", "", ""]);

    [companyRow, titleRow].forEach((row, index) => {
      row.font = {
        bold: true,
        size: index === 0 ? 12 : 16,
        color: { argb: "FFFFFFFF" },
        name: 'Arial'
      };
      row.fill = {
        type: 'pattern' as 'pattern',
        pattern: 'solid' as 'solid',
        fgColor: { argb: index === 0 ? "FF34495E" : "FF2C3E50" }
      };
      row.alignment = {
        horizontal: "center" as "center",
        vertical: "middle" as "middle"
      };
      row.height = index === 0 ? 30 : 35;
    });

    worksheet.mergeCells('B1:E1');
    worksheet.mergeCells('B2:E2');

    worksheet.addRow(["", "", "", "", "", ""]);

    let currentRow = 4;

    currentRow = addSection(worksheet, currentRow, "INFORMATIONS GÉNÉRALES", [
      { label: "Date", value: report_data.date || "Non spécifiée" },
      { label: "Équipe", value: report_data.shift || "Non spécifiée" },
      { label: "Technicien", value: report_data.technician || "Non spécifié" }
    ]);

    currentRow = addSection(worksheet, currentRow, "INFORMATIONS ÉQUIPEMENT", [
      { label: "ID Équipement", value: report_data.equipment_id || "Non spécifié" },
      { label: "Nom Équipement", value: report_data.equipment_name || "Non spécifié" },
      { label: "Localisation", value: report_data.equipment_location || "Non spécifiée" }
    ]);

    currentRow = addSection(worksheet, currentRow, "DÉTAILS INTERVENTION", [
      { label: "Type de Maintenance", value: report_data.maintenance_type || "Non spécifié" },
      { label: "Statut Intervention", value: report_data.status || "Non spécifié" }
    ]);

    currentRow = addTextAreaSection(worksheet, currentRow, "Description des Travaux",
      report_data.work_description || "Aucune description fournie", 60);

    currentRow = addSection(worksheet, currentRow, "OBSERVATIONS", []);

    currentRow = addTextAreaSection(worksheet, currentRow, "Anomalies Détectées",
      report_data.anomalies_detected || "Aucune anomalie détectée", 50);

    currentRow = addTextAreaSection(worksheet, currentRow, "Actions Correctives",
      report_data.corrective_actions || "Aucune action corrective", 50);

    currentRow = addSection(worksheet, currentRow, "RESSOURCES UTILISÉES", []);

    currentRow = addTextAreaSection(worksheet, currentRow, "Pièces Utilisées",
      report_data.parts_used || "Aucune pièce utilisée", 40);

    currentRow = addTextAreaSection(worksheet, currentRow, "Outils Utilisés",
      report_data.tools_used || "Aucun outil utilisé", 40);

    currentRow = addSection(worksheet, currentRow, "TEMPS D'INTERVENTION", [
      { label: "Heure Début", value: report_data.start_time || "Non spécifiée" },
      { label: "Heure Fin", value: report_data.end_time || "Non spécifiée" },
      { label: "Total Heures", value: report_data.total_hours || "Non spécifié" }
    ]);

    currentRow = addSection(worksheet, currentRow, "VÉRIFICATIONS", [
      {
        label: "Vérification Sécurité",
        value: report_data.safety_check ? "✅ COMPLÉTÉ" : "❌ NON COMPLÉTÉ"
      },
      {
        label: "Nettoyage Effectué",
        value: report_data.cleanliness_check ? "✅ COMPLÉTÉ" : "❌ NON COMPLÉTÉ"
      },
      {
        label: "Tests Fonctionnels",
        value: report_data.testing_check ? "✅ COMPLÉTÉ" : "❌ NON COMPLÉTÉ"
      },
      {
        label: "Documentation Mise à Jour",
        value: report_data.documentation_check ? "✅ COMPLÉTÉ" : "❌ NON COMPLÉTÉ"
      }
    ]);

    currentRow = addSection(worksheet, currentRow, "NOTES ADDITIONNELLES", [
      { label: "Prochaine Maintenance Prévue", value: report_data.next_maintenance || "Non planifiée" }
    ]);

    currentRow = addTextAreaSection(worksheet, currentRow, "Notes",
      report_data.notes || "Aucune note", 40);

    worksheet.addRow(["", "", "", "", "", ""]);
    currentRow++;

    const signatureRow = worksheet.addRow([
      "",
      "Technicien: ________________________",
      "",
      "Superviseur: ________________________",
      "",
      ""
    ]);

    signatureRow.font = {
      italic: true,
      size: 11,
      color: { argb: "FF7F8C8D" },
      name: 'Arial'
    };
    signatureRow.alignment = { horizontal: "left" as "left" };

    worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
    worksheet.mergeCells(`D${currentRow}:E${currentRow}`);

    currentRow++;

    worksheet.addRow(["", "", "", "", "", ""]);
    const footerRow = worksheet.addRow([
      "",
      `Document généré électroniquement le ${new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} - Système de Gestion de Maintenance Préventive`,
      "", "", "", ""
    ]);

    footerRow.font = {
      size: 9,
      color: { argb: "FF95A5A6" },
      italic: true,
      name: 'Arial'
    };

    footerRow.alignment = { horizontal: "center" as "center" };
    worksheet.mergeCells(`B${currentRow + 2}:E${currentRow + 2}`);

    worksheet.pageSetup = {
      margins: {
        left: 2.5,
        right: 1,
        top: 1,
        bottom: 1,
        header: 0.5,
        footer: 0.5
      },
      horizontalCentered: false,
      verticalCentered: false
    };

    applyShiftedBorders(worksheet);

    const fileName = `Rapport_Maintenance_${zone}_${report_data.equipment_id || 'SansReference'}_${report_data.date || new Date().toISOString().split('T')[0]}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, fileName);
  } catch (error) {
    console.error("Erreur génération Excel:", error);
    throw error;
  }
}

function addSection(worksheet: ExcelJS.Worksheet, startRow: number, title: string, items: Array<{label: string, value: any}>) {
  const titleRow = worksheet.addRow(["", title, "", "", "", ""]);
  titleRow.font = {
    bold: true,
    size: 12,
    color: { argb: "FFFFFFFF" },
    name: 'Arial'
  };
  titleRow.fill = {
    type: 'pattern' as 'pattern',
    pattern: 'solid' as 'solid',
    fgColor: { argb: "FF3498DB" }
  };
  titleRow.alignment = {
    horizontal: "center" as "center",
    vertical: "middle" as "middle"
  };
  titleRow.height = 28;
  worksheet.mergeCells(`B${startRow}:E${startRow}`);

  let currentRow = startRow + 1;

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const row = worksheet.addRow([
      "",
      item.label,
      item.value,
      "",
      "",
      ""
    ]);

    worksheet.getCell(`B${currentRow}`).font = {
      bold: true,
      size: 10,
      color: { argb: "FF2C3E50" },
      name: 'Arial'
    };
    worksheet.getCell(`B${currentRow}`).fill = {
      type: 'pattern' as 'pattern',
      pattern: 'solid' as 'solid',
      fgColor: { argb: isEven ? "FFF8F9FA" : "FFECF0F1" }
    };
    worksheet.getCell(`B${currentRow}`).alignment = {
      horizontal: "left" as "left",
      vertical: "middle" as "middle"
    };

    worksheet.getCell(`C${currentRow}`).font = {
      size: 10,
      color: { argb: "FF34495E" },
      name: 'Arial'
    };
    worksheet.getCell(`C${currentRow}`).fill = {
      type: 'pattern' as 'pattern',
      pattern: 'solid' as 'solid',
      fgColor: { argb: isEven ? "FFF8F9FA" : "FFECF0F1" }
    };
    worksheet.getCell(`C${currentRow}`).alignment = {
      horizontal: "left" as "left",
      vertical: "middle" as "middle"
    };

    worksheet.mergeCells(`D${currentRow}:E${currentRow}`);
    currentRow++;
  });

  worksheet.addRow(["", "", "", "", "", ""]);
  return currentRow + 1;
}

function addTextAreaSection(worksheet: ExcelJS.Worksheet, startRow: number, label: string, value: any, height: number = 40) {
  const labelRow = worksheet.addRow(["", label, "", "", "", ""]);
  worksheet.getCell(`B${startRow}`).font = {
    bold: true,
    size: 10,
    color: { argb: "FF2C3E50" },
    name: 'Arial'
  };
  worksheet.getCell(`B${startRow}`).fill = {
    type: 'pattern' as 'pattern',
    pattern: 'solid' as 'solid',
    fgColor: { argb: "FFECF0F1" }
  };
  worksheet.getCell(`B${startRow}`).alignment = {
    horizontal: "left" as "left",
    vertical: "middle" as "middle"
  };
  worksheet.mergeCells(`B${startRow}:E${startRow}`);

  const valueRow = worksheet.addRow(["", value, "", "", "", ""]);
  worksheet.getCell(`B${startRow + 1}`).font = {
    size: 10,
    color: { argb: "FF34495E" },
    name: 'Arial'
  };
  worksheet.getCell(`B${startRow + 1}`).alignment = {
    vertical: "top" as "top",
    horizontal: "left" as "left",
    wrapText: true
  };
  worksheet.mergeCells(`B${startRow + 1}:E${startRow + 1}`);
  valueRow.height = height;

  worksheet.addRow(["", "", "", "", "", ""]);
  return startRow + 3;
}

function applyShiftedBorders(worksheet: ExcelJS.Worksheet) {
  const lightGray = { argb: "FFBDC3C7" };
  const mediumGray = { argb: "FF95A5A6" };

  worksheet.eachRow((row, rowNumber) => {
    if (row.getCell(2).value === null || row.getCell(2).value === "") {
      return;
    }

    for (let col = 2; col <= 5; col++) {
      const cell = row.getCell(col);
      const isSectionTitle = rowNumber <= 2 ||
        (typeof cell.value === 'string' &&
          ['INFORMATIONS', 'DÉTAILS', 'OBSERVATIONS', 'RESSOURCES', 'TEMPS', 'VÉRIFICATIONS', 'NOTES']
            .some(section => (cell.value as string).includes(section)));

      cell.border = {
        top: {
          style: isSectionTitle ? 'medium' as 'medium' : 'thin' as 'thin',
          color: isSectionTitle ? mediumGray : lightGray
        },
        left: {
          style: isSectionTitle ? 'medium' as 'medium' : 'thin' as 'thin',
          color: isSectionTitle ? mediumGray : lightGray
        },
        bottom: {
          style: isSectionTitle ? 'medium' as 'medium' : 'thin' as 'thin',
          color: isSectionTitle ? mediumGray : lightGray
        },
        right: {
          style: isSectionTitle ? 'medium' as 'medium' : 'thin' as 'thin',
          color: isSectionTitle ? mediumGray : lightGray
        }
      };
    }
  });
}
