import * as React from "react";
import axios from "../../utils/Api";
import { PagedAutocomplete } from "./PagedAutocomplete";

export type ItemOption = { id: number; description: string };

export default function ItemSelect({
  typeId, // e.g. "P"
  value,
  onChange,
  //label = "Item",
  placeholder = "Select ... ",
  pageSize = 50,
  category = "all",
}: {
  typeId: string | number;
  value: ItemOption | null;
  onChange: (v: ItemOption | null) => void;
  //label?: string;
  placeholder?: string;
  pageSize?: number;
  category?: "all" | "has" | "none"; // <-- ADD THIS
}) {
  return (
    <PagedAutocomplete<ItemOption>
      fetchPage={async ({ q, page, limit }) => {
        // your paged backend: /api/items/type/:id?q=&page=&limit=
        const res = await axios.get(`/items/type/${typeId}`, {
          params: { q,_search : q, page, limit, category },
        });
        const totalCount = res.data?.totalCount ?? 0;
        const data = (res.data?.data ?? []).map((r: any) => ({
          id: r.id ?? r.item_id, // map to { id, description }
          description: r.description,
        })) as ItemOption[];
        return { totalCount, data };
      }}
      getOptionKey={(o) => o.id}
      getOptionLabel={(o) => o.description}
      value={value}
      onChange={onChange}
      // label={label}
      placeholder={placeholder}
      pageSize={pageSize}
      renderOptionContent={(opt) => (
        <>
          <strong>{opt.description}</strong>
          <span style={{ marginInlineStart: 8, color: "#666", fontSize: 12 }}>
            ID: {opt.id}
          </span>
        </>
      )}
    />
  );
}
