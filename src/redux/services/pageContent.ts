import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Type definitions
interface TranslationItem {
  text: string;
  type: "LABEL" | "INFO" | "ERROR";
  disabled: boolean;
}

interface TranslationsData {
  types: ["LABEL", "INFO", "ERROR"];
  LABEL: Record<string, TranslationItem>;
  INFO: Record<string, TranslationItem>;
  ERROR: Record<string, TranslationItem>;
}

interface ApiResponse {
  data: TranslationsData;
}

export const translationsApi = createApi({
  reducerPath: "translationsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Translations"],
  endpoints: (builder) => ({
    getTranslations: builder.query<TranslationsData, number>({
      query: (pageId) => `api/trans/resources/${pageId}`,
      transformResponse: (response: ApiResponse) => response.data,
      providesTags: (result, error, pageId) =>
        result ? [{ type: "Translations" as const, id: pageId }] : [],
    }),

    updateTranslation: builder.mutation<
      void,
      { pageId: number; key: string; value: Partial<TranslationItem> }
    >({
      query: ({ pageId, ...body }) => ({
        url: `api/trans/resources/${pageId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { pageId }) => [
        { type: "Translations", id: pageId },
      ],
    }),
  }),
});

export const {
  useGetTranslationsQuery,
  useUpdateTranslationMutation,
  useLazyGetTranslationsQuery,
} = translationsApi;

export type { TranslationItem, TranslationsData };
