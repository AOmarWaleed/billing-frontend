import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button, Box, CircularProgress, Alert, SxProps } from "@mui/material";
import CustomInput from "./Inputs/CustomInput";
import SearchIcon from "@mui/icons-material/Search";
//! ***
// all props that field need
export type FieldConfig = {
  name: string;
  label: string;
  type: string;
  options?: string[];
  optionsWithKeyAndValue?: {key : string , value : string}[];
  size?: "small" | "medium";
  withIcon?: boolean;
  icon?: React.ReactNode;
  position?: "start" | "end";
  margin?: "dense" | "normal" | "none";
  widthPercentage?: string;

};

//! TODO BACK IT REQUIRED!!!
interface CustomFormProps {
  fields: FieldConfig[]; //! ***
  initialValues: Record<string, any>; // { keyString : valueAny }
  onSubmit: (values: any) => void;
  loading: boolean;
 
  error: any;
  validationSchema: Yup.ObjectSchema<any>,
  parentSX: SxProps;
  btnIcon?: JSX.Element
  btnText?: string
}

export default function CustomForm({
  fields,
  initialValues,
  onSubmit,
  loading,
  error,
  validationSchema,
  parentSX = { display: "flex", flexDirection: "column", gap: 2 },
  btnIcon = <SearchIcon />,
  btnText = "search",
  
}: CustomFormProps) {
  return (
    <Formik validationSchema={validationSchema} initialValues={initialValues} onSubmit={onSubmit}>
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error.message}</Alert>}
          <Box sx={parentSX}>
            {fields.map((field) => {
              return (
                <CustomInput
                  key={field.name}

                  name={field.name}
                  label={field.label}
                  type={field.type}
                  options={field.options}
                  optionsWithKeyAndValue={field.optionsWithKeyAndValue}
                  size={field.size}
                  withIcon={field.withIcon}
                  icon={field.icon}
                  position={field.position}
                  margin={field.margin}
                  widthPercentage={field.widthPercentage}
                />
              );
            })}
            <Button
              type="submit"
              variant="contained"
              endIcon={
                loading ? <CircularProgress size={20} /> : btnIcon
              }
              disabled={loading}
            >
              {btnText}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
}
