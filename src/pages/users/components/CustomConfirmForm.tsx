import { Box } from "@mui/material";
import React from "react";

import Secure from "../../../shared/security";

interface CustomConfirmFormProps {
  message: string;
  handleClose: () => void;
  handleConfirm: () => void;
}
// Form Component
const CustomConfirmForm: React.FC<CustomConfirmFormProps> = ({
  message,
  handleClose,
  handleConfirm,
}) => {
  const handleSubmit = (
    values: UserFormValues,
    { setSubmitting }: FormikHelpers<UserFormValues>
  ) => {
    console.log("Form submitted:", values);

    // Transform UserFormValues into UserDTO
    const transformedValues: UserDTO = {
      ...values,
      user_name: values.user_name,
      first_name: values.first_name, // Ensure first_name is not null
      middle_name: values.middle_name || "", // Convert null to empty string
      family_name: values.family_name, // Ensure first_name is not null
      prefered_language: values.prefered_language || "", // Convert null to empty string
      group_id: values.group_id || null, // Ensure group_id is null if not provided
      password_expiry_date: values.password_expiry_date || null, // Ensure date is null if not provided
      employee_id: values.employee_id || null, // Ensure employee_id is null if not provided
      active: values.active || false, // Default to false if not provided
      locked: values.locked || false, // Default to false if not provided
      password: values.password,
    };

    // Call addUserHandler with the transformed values
    addUserHandler(transformedValues, handleClose);

    setSubmitting(false); // Reset submitting state
  };
  return (
    <Box sx={{ maxWidth: 500, mx: "auto" }}>
      Are you sure you want to{" "}
      {actionType === "active" ? "activate/deactivate" : "lock/unlock"} this
      user?
      <Secure.GLButton resource_key="Cancel_Group" onClick={handleClose}>
        Cancel
      </Secure.GLButton>
      <Secure.GLButton
        resource_key="Submit_Group"
        onClick={handleConfirm}
        color="primary"
      >
        Confirm
      </Secure.GLButton>
    </Box>
  );
};

export default CustomConfirmForm;
