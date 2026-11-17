export interface User {
  user_id: number;
  user_name: string;
  first_name: string;
  middle_name: string;
  family_name: string;
  group_id: number | null;
  employee_id: number | null;
  group_name: string;
  active: string;
  locked: string;
  password_expiry_date: Date | null;
  password: string;
  email: string;
}
