
export interface ResourceItem {
  resource_id: string;
  text: string;
  ar_text: string | null;
  resource_type: string;
  hidden: boolean | null;
  disabled: boolean | null;
}
export interface ComponentStatesResponse {
  resources: ResourceItem[];
}