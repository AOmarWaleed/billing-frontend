// under development ,doesn't use in the app
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
export const ENDPOINTS = { 

//ITEMS: `${API_BASE_URL}/items`, 
ITEMS: '/items', 
ITEM_BY_ID: (id: number) => `/items/${id}`, 
DELETE_ALL_ITEMS: `/items`, 
FIND_BY_ID: (id: number) => `/items?id=${id}`,
 }; 
export default ENDPOINTS;