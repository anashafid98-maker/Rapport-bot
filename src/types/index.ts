export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  zone: 'OSBL-SAP' | 'DAP' | 'PAP' | null;
  created_at: string;
}

export interface ReportData {
  date: string;
  shift: string;
  technician: string;
  equipment_id: string;
  equipment_name: string;
  equipment_location: string;
  maintenance_type: string;
  work_description: string;
  anomalies_detected: string;
  corrective_actions: string;
  parts_used: string;
  tools_used: string;
  start_time: string;
  end_time: string;
  total_hours: string;
  safety_check: boolean;
  cleanliness_check: boolean;
  testing_check: boolean;
  documentation_check: boolean;
  status: string;
  notes: string;
  next_maintenance: string;
}

export interface Report {
  id: string;
  user_id: string;
  zone: 'OSBL-SAP' | 'DAP' | 'PAP';
  report_data: ReportData;
  status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
}
