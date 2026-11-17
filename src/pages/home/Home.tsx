import { Box } from "@mui/material";
import HandleTitle from "../../components/HandleTitle/HandleTitle";

import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
const Home = () => {
  //! translate
  const { t } = useTranslation("1");
  const { language } = useLanguage();


  return (
    <div>
    
      <HandleTitle titleKey="HOME" />
      <Box
        sx={{
          minHeight: "calc(100vh - 94px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div className="">
          <h1
            style={{
              marginBottom: "20px",
              backgroundImage: "linear-gradient()",
            }}
          >
            {t("530") || "WELCOME TO RCM"}
            {/* {getContentHelperFun({
              content,
              pageId: 1,
              type: "LABEL",
              key: "WELCOME_MSG",
            })} */}
          </h1>
          {language === "en" ? (
            <img src="login-logo.png" style={{ maxWidth: "50%" }} alt="" />
          ) : (
            <img src="logo-ar.png" style={{ maxWidth: "50%" }} alt="" />
          )}
        </div>
      </Box>
    </div>
  );
};

export default Home;
