export interface Module {
    module_id: string;
    description: string;
  }
  

  
  export interface SystemRule {
    conf_key: string;
    conf_value: string;
    description: string;
    module_id: string;
    facility_id?: number | string;
    config_status?: "inherited" | "overridden" | null;
    created_by?: number;
    creation_date?: string;
    modified_by?: number | null;
    modification_date?: string | null;
    created_by_name?: string;
    modified_by_name?: string;
  }
  
  export interface FilterValues {
    conf_key: string;
    conf_value: string;
    description: string;
    module_id: string;
  }