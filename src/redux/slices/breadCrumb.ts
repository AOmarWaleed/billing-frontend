import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { title: 'Home', path: '/' }
  ],
};

const breadcrumbSlice = createSlice({
  name: 'breadcrumb',
  initialState,
  reducers: {
    setBreadcrumbs: (state, action) => {
      state.items = [{ title: 'Home', path: '/' }, ...action.payload];
    },
    pushBreadcrumb: (state, action) => {
      state.items.push(action.payload);
      console.log();
      
    },
    popBreadcrumb: (state) => {
      if (state.items.length > 1) {
        state.items.pop();
      }
    },
    resetBreadcrumbs: (state) => {
      state.items = [{ title: 'Home', path: '/' }];
    },
  },
});

export const { 
  setBreadcrumbs, 
  pushBreadcrumb, 
  popBreadcrumb, 
  resetBreadcrumbs 
} = breadcrumbSlice.actions;

export default breadcrumbSlice.reducer;