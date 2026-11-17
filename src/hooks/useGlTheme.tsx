// import { useDispatch, useSelector } from "react-redux";
// import {
//   setTheme,
//   ModeType,
 
// } from "../redux/slices/themeSlice";
// import { AppDispatch, RootState } from "../redux/store";

// export const useGlTheme = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const {
//     mode,
//   } = useSelector((state: RootState) => state.theme);

//   return {
//     mode,

//     setTheme: (theme: string) => dispatch(setTheme(theme)),
//     setButtonsProps: (buttons: propsType) => dispatch(setButtonsProps(buttons)),
//     setDataGridProps: (dataGrid: propsType) =>
//       dispatch(setDataGridProps(dataGrid)),
//     setDialogProps: (dialog: propsType) => dispatch(setDialogProps(dialog)),
//     setTextFieldProps: (textField: propsType) =>
//       dispatch(setTextFieldProps(textField)),
//     setDataGridRowHeight: (rowHeight: number) =>
//       dispatch(setDataGridRowHeightProps(rowHeight)),


//     getUserTheme : (folderName:string)=> dispatch(fetchUserTheme(folderName))
//   };
// };
