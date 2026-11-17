export interface Item {
  item_id: number;
  description: string;
  longDescription: string;
  category: string;
  item_bk: string;
}

export interface Payer {
  id: number;
  name: string;
  description: string;
}

// export interface LimitedItem {
//   id: number;
//   package_conf_id: number;
//   code: string | null;
//   name: string;
//   limit_quantity: number | null;
//   limit_day_amount: number | null;
// }

// export interface ExcludedItem {
//   id: number;
//   package_conf_id: number;
//   code: string | null;
//   name: string;
// }

// export interface CategoryItem {
//   id: number;
//   name: string;
// }

// export interface Category {
//   code_type: number;
//   code: string;
//   user_code: string;
//   description: string;
// }


export interface PackageItem {
 package_conf_id: string;
  package_item_id: string;
  payer_id: string;
  item_id: string;
  parent_description?: string;
  item_description?: string;
  category_description?: string;
  item_category: string | null;
  limit_quantity: number | null;
  status: 'ACTIVE' | 'INACTIVE' | string;
  relation: 'INCLUDE' | 'EXCLUDE' | string;
  limit_amount: number | null;
  limit_day_amount: number | null;
  limit_amount_exclude: string;
  facility_id?: number | null;
  created_by?: number | null;
  creation_date?: string | Date | null;
}

export interface Package {
  package_item_id: string;
  description : string ,
  limited: PackageItem[];
  excluded: PackageItem[];
  category: PackageItem[];
}

// export interface Package {
//   package_item_id: number;
//   package_name: string | null;
//   package_code: string | null;
//   days: string;
//   id: number;
//   payer_id: number;
//   limit_quantity: number;
//   status: string;
//   relation: string;
//   limit_amount: number;
//   limit_day_amount: number;
//   limit_amount_exclude: number;
//   included_items_count: string;
//   excluded_items_count: string;
//   limited: LimitedItem[];
//   excluded: ExcludedItem[];
//   category: CategoryItem[];
// }

export interface PackageResponse {
  packages: Package[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  payers: Payer[];
  items: Item[];
}

export interface LimitCategoryPayload {
  packageId: string | number;
  values: {
    item_category: string;
    relation: string;
    limit_quantity?: string;
    limit_amount?: string;
    limit_day_amount?: string;
    exclude_items: number[];
    payer_id?: string | number | null;
    facility_id?: string | number | null;
  };
}
