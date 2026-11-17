import { GridColDef } from "@mui/x-data-grid";

export type CustomGridColDef = GridColDef & {
    id?: string;
    name?: string;
    resource_key: string;
};