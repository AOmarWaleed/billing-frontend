export interface MappingRow {
  id: number;
  map_id: number | null;
  app_code: string;
  app_sub_code: string;
  description: string;
  sub_description: string | null;
  map_to_code_id: number | null;
  ext_description: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface ExternalCode {
  code_id: number;
  code: string;
  description: string;
}