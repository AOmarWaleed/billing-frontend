export interface CodeSet {
  set_id: number;
  set_description: string;
  set_query: string;
  code_type: number | null;
  code_data: Array<{
    code: string;
    user_code: string;
    description: string;
    cat_code: string;
    linked_code: string;
    sub_code_type: number;
  }>;
}

export interface CodingData {
  base_code: string;
  base_description: string;
  sub_code_type: number;
  categories: Array<{
    code: string;
    user_code: string;
    description: string;
    cat_code: string;
    linked_code: string;
    sub_code_type: number;
  }>;
}
export interface MappingRow {
  id: number;
  map_id: number | null;
  app_code: string;
  app_sub_code: string;
  description: string;
  sub_description: string | null;
  map_to_code_id: number | null;
  ext_code: string | null;
  ext_description: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface ExternalCode {
  code_id: number;
  code: string;
  description: string;
}

export interface CodeType {
  code_type: number;
  description: string;
}
