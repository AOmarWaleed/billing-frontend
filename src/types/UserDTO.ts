export interface UserDTO {
  user_name: string;
  first_name: string;
  middle_name: string;
  family_name: string;
  group_id: number | null;
  password_expiry_date: Date | null;
  employee_id: number | null;
  email: string | null;
  password: string;
}
