export interface Policy {
  policy_id: number;
  description: string | null;
  payer_id: number | null;
  payer_description: string | null;
  price_list_id: number | null;
  start_date: string | null;
  end_date: string | null;
  policy_number: string | null;
  policy_holder: string | null;
  sponsor_number: string | null;
  network: string | null;
  class_name: string | null;
  copay_percent: number | null;
  copay_max: number | null;
  coverage_id: number | null;
  created_by: number;
  creation_date: string;
  modified_by: number | null;
  modification_date: string | null;
}