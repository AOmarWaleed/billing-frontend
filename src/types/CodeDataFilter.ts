export interface CodeDataFilter {
  code: string;
  user_code: string;
  linked_user_code: string;
  description: string;
  linked_code: number | null;
  linked_description: string;
  sub_code_type: number | null;
  sub_type_description: string;
  cat_code: string;
}
