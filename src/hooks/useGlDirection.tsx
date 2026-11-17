// import { useDispatch, useSelector } from 'react-redux';
// import { toggleDirection, setDirection, DirectionType } from "../redux/slices/themeSlice";
// import { RootState } from "../redux/store";


// export const useGlDirection = () => {
//   const dispatch = useDispatch();
//   const direction = useSelector((state:RootState) => state.theme.direction);
  
//   return {
//     direction,
//     isRtl: direction === 'rtl',
//     isLtr: direction === 'ltr',
    
//     toggleDirection: () => dispatch(toggleDirection()),
//     setDirection: (dir :DirectionType) => dispatch(setDirection(dir)),
//   };
// };