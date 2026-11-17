// types/ItemGroup.ts
export interface Item {
  item_id: number;
  description: string;
  longDescription: string;
  category: string;
  subCategory: string;
  drugType: string;
  autoAdded: string;
  set_id: number;
}

export interface Payer {
  id: number;
  name: string;
  description: string;
}

export interface ItemGroupSet {
  set_id: number;
  group_id: number;
  set_type: string;
  set_code: string;
  description: string;
  status: string;
  action: string;
  auto_sync: string;
}

export interface ItemGroupSetDTO {
  group_id: number;
  auto_add_new_item: boolean; // auto_add_new_item
  set_type: string;
  set_code: string;
  status: string;
  process_type: string; // action
}
export interface Category {
  code_type: number;
  code: string;
  user_code: string;
  description: string;
  sub_codes: Category[]; // recursive definition
}
export interface ItemGroup {
  group_id: number;
  description: string;
  drug_dispensing_type: string;
  nphies_benefit_category: string;
  itemDrugTypes: string[];
  payer: Payer;
  sets: ItemGroupSet[];
  items: Item[]; // New field for group items
  setCount: number;
}
