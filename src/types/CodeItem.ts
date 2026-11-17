export interface CodeItem {
  code_type: number;
  code: string;
  user_code: string;
  description: string;
  sub_code_type?: number;
}

export interface HierarchicalCodeItem extends Omit<CodeItem, "sub_code_type"> {
  sub_codes: Omit<CodeItem, "sub_code_type">[];
}
