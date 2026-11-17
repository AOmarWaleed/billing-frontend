import { Formik, Form, Field, FieldProps, FormikHelpers } from "formik";
import { TextField, Button, Box, Typography, Divider, InputLabel, Select, MenuItem, FormControl, Autocomplete } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useEffect, useState } from "react";
import { Group } from "../../types/Group";
import { fetchMenus } from "../../redux/slices/groupsSlice";
import { SelectOption } from "../../types/SelectOpion";
import { parse, format } from "date-fns";
import { Menu } from "../../types/Menu";

interface CustomUserFormProps {
  isNew?: boolean; // Optional flag to indicate a new row
  editId: number;
  editRow: any;
  handleClose: () => void;
  error: string | null;
}
// Form Component
const CustomGroupForm: React.FC<CustomUserFormProps> = ({ isNew, editId, editRow, handleClose, error }) => {
  const menus = useAppSelector((state) => state.groups.menus);
  const users = useAppSelector((state) => state.users.users);
  const [selectedGroupText, setSelectedGroupTextOption] = useState<string>();
  const [selectedGroupOption, setSelectedGroupOption] = useState<Menu | null>();
  const [selectedUser, setSelectedUser] = useState();
  const [menuOptions, setMenuOptions] = useState<SelectOption[]>([]);
  const [selectedText, setSelectedTextOption] = useState<string>();
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>();
  const dispatch = useAppDispatch();
  // const handleChange = (event: ChangeEvent<HTMLInputElement> | SelectChangeEvent<number>) => {
  //       const { name, value } = event.target;

  //         const newValue = (name === 'linked_code' || name === 'sub_code_type') ? ( value? Number(value) : null) : (value? value : '');
  //         setData({ ...data, [name]: newValue });

  //     };
  useEffect(() => {
    dispatch(fetchMenus()).unwrap();
    const groupOptionsTemp = menus.map((type) => ({
      label: `${type.menu_id} - ${type.description}`,
      id: type.menu_id,
    }));
    setMenuOptions(groupOptionsTemp);
  }, []);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {};
  return (
    <Box sx={{ maxWidth: 500, mx: "auto" }}>
      {error && <span style={{ color: "#ef5350" }}>{error}</span>}

      {/* First Name and Middle Name */}
      <Box display="flex" gap={2} mb={2}>
        <Box flex={1}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Group Name
          </Typography>
          <TextField name="group_name" id="group_name" fullWidth variant="outlined" />
        </Box>
        <Box flex={1}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Description
          </Typography>

          <TextField fullWidth variant="outlined" />
        </Box>
      </Box>

      {/* Family Name and Employee ID */}
      <Box display="flex" gap={2} mb={2}>
        <Box flex={1}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Auth provider group
          </Typography>

          <TextField fullWidth variant="outlined" />
        </Box>
        <Box flex={1}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Menu Id
          </Typography>
          <Autocomplete
            id="menu_id"
            value={selectedOption || null}
            inputValue={selectedText || ""}
            onInputChange={(event, newInputValue) => {
              setSelectedTextOption(newInputValue ? newInputValue : "");
            }}
            options={menuOptions}
            onChange={(event, newValue: { label: string; id: number } | null) => {
              setSelectedOption(newValue);
              // handleChange({
              //   target: {
              //     name: "sub_code_type",
              //     value: newValue ? newValue.id : null,
              //   },
              // });
            }}
            renderInput={(params) => <TextField {...params} fullWidth placeholder="SELECT MENU" />}
            sx={{ width: "100%" }}
          />
        </Box>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3, backgroundColor: "grey.800" }} />

      {/* Buttons */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        {isNew ? (
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        ) : (
          <Button type="submit" variant="contained" color="primary">
            Save Update
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CustomGroupForm;
