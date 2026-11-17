export interface  CodeData{ 
    code: number, 
    code_type: number,
    user_code: string,
    description: string,
    linked_code:number | null,
    linked_description: string,  
    sub_code_type:number | null,
    sub_type_description:string,
    cat_code: string[] | null;
    col_1: string | null;
    col_2: string | null;
    col_3: string | null;
}