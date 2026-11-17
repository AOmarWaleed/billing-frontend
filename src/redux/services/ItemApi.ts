// this is an exmple for RTK query , doeen't use in the app , should be delete in porduction 
//itemsApi.ts 
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'; 
import { ItemData } from '../../types/ItemData'; 

const baseUrl = import.meta.env.VITE_API_BASE_URL; // Adjust the base URL as needed 

export const itemsApi = createApi({ 
    reducerPath: 'itemsApi', 
    baseQuery: fetchBaseQuery({ baseUrl }), 
    endpoints: (builder) => ({ 
        getAllItems: builder.query<ItemData[], void>({ 
            query: () => '/items',
         }), 
         
         getItem: builder.query<ItemData, number>({ 
            query: (id) => `/items/${id}`, 
        }), 
        
        createItem: builder.mutation<ItemData, ItemData>({ 
            query: (data) => ({ url: '/items', method: 'POST', body: data, }),
         }), 
         
         updateItem: builder.mutation<ItemData, { id: number; data: ItemData }>({
             query: ({ id, data }) => ({ url: `/items/${id}`, method: 'PUT', body: data, }),
             }), 
        deleteItem: builder.mutation<void, number>({
                 query: (id) => ({ url: `/items/${id}`, method: 'DELETE', }), 
                }),
         deleteAllItems: builder.mutation<void, void>({ 
            query: () => ({ url: '/items', method: 'DELETE', }), 
        }), 
        
        findItemById: builder.query<ItemData, number>({ 
            query: (id) => `/items?id=${id}`, }), }), 
        }); 
        
export const { 
    useGetAllItemsQuery, 
    useGetItemQuery, 
    useCreateItemMutation, 
    useUpdateItemMutation, 
    useDeleteItemMutation, 
    useDeleteAllItemsMutation, 
    useFindItemByIdQuery, 
}
    
 = itemsApi;