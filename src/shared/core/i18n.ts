import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import { getBaseUrl } from "../../utils/getBaseUrl";

const savedLang = sessionStorage.getItem("lang") || "en";
const savedDir = sessionStorage.getItem("dir") || "ltr";


i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    defaultNS: "0",
    ns: ["0"],

    lng: savedLang,
    fallbackLng: "en",

    backend: {
      loadPath: `${getBaseUrl(`${import.meta.env.VITE_API_BASE_URL}api/public/resources/page/{{lng}}/{{ns}}`)}`,
    },

    react: { useSuspense: false },
  });

export default i18n;
