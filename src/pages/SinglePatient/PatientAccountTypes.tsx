export interface Patient {
  attendance_type: string; // "I" or maybe others
  created_by: string;
  creation_date: string; // ISO datetime string
  end_date: string | null;
  episode_no: string;
  facility_id: string | null;
  modification_date: string | null;
  modified_by: string | null;
  patient_id: string;
  start_date: string; // ISO date string (YYYY-MM-DD)
  status: string | null;
}
