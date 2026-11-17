import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home } from "@mui/icons-material";
import { Breadcrumbs, Typography } from "@mui/material";
import { RootState } from "../../redux//store";
import { useTranslation } from "react-i18next";
export const breadcrumbTranslations = {
  en: {
    home: "Home",
    items: "Items",
    settings: "Settings",
    payers: "Payers",
    patients: "Patients",
    "item prices": "Item Prices",
    "code types": "Code Types",
    users: "Users",
    "item master": "Item Master",
    item: "Item",
    edit: "edit",
    add: "add",
    "add resource": "Resources",
  },
  ar: {
    home: "الرئيسية",
    items: "العناصر",
    settings: " الاعدادات",
    payers: "الدافعين",
    patients: "المرضى",
    "item prices": "أسعار العناصر",
    "code types": "أنواع الرموز",
    users: "المستخدمين",
    "item master": "عنصر الماجستير",
    edit: "تعديل",

    "add resource": "ترجمة",
  },
};
const Breadcrumb = () => {
  const { items } = useSelector((state: any) => state.breadCrumb);
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      sx={{ marginInlineStart: 3, alignSelf: "center", color: "inherit" }}
    >
      {items.map((item: { path: string; title: string }, index: number) => (
        <div key={index}>
          {index === 0 ? (
            <Typography
              onClick={() => navigate(item.path)}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Home fontSize="small" sx={{ mr: 0.5 }} />
              {breadcrumbTranslations[currentLanguage].home}
            </Typography>
          ) : index === items.length - 1 ? (
            <Typography>
              {breadcrumbTranslations[currentLanguage][
                item.title.toLowerCase()
              ] || item.title}
            </Typography>
          ) : (
            <Typography
              onClick={() => navigate(item.path)}
              sx={{ textDecoration: "none", cursor: "pointer" }}
            >
              {breadcrumbTranslations[currentLanguage][
                item.title.toLowerCase()
              ] || item.title}
            </Typography>
          )}
        </div>
      ))}
    </Breadcrumbs>
  );
};

export default Breadcrumb;

export const generateBreadcrumbs = (
  pathname: string,
  language: string = "en",
) => {
  const pathnames = pathname.split("/").filter((x) => x);
  return pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;

    // Try to get translation first
    const translatedName = breadcrumbTranslations[language][name.toLowerCase()];

    // If no translation, format the name
    const title =
      translatedName ||
      (name.charAt(0).toUpperCase() + name.slice(1)).replace(
        /([-_])([a-z])/g,
        (match, p1, p2) => ` ${p2.toUpperCase()}`,
      );

    return {
      title: title,
      path: routeTo,
    };
  });
};
