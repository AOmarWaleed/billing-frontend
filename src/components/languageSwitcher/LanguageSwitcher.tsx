import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { useState, MouseEvent } from "react";
import { Language as LanguageType  } from "../../types/Language";


interface Language {
  code: string;
  name: string;
  icon: string;
}

interface LanguageSwitcherProps {
  currentLanguage: LanguageType;
  onChangeLanguage: (langCode: LanguageType) => void;
}

const LanguageSwitcher = ({ currentLanguage, onChangeLanguage }: LanguageSwitcherProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const languages: Language[] = [
    { code: "en", name: "English", icon: "🇬🇧" },
    { code: "ar", name: "العربية", icon: "🇸🇦" },
  ];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode: LanguageType) => {
    onChangeLanguage(langCode);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        aria-label="language switcher"
        aria-controls="language-menu"
        aria-haspopup="true"
        
        aria-expanded={open ? "true" : undefined}>
        <LanguageIcon />
        <Typography variant="caption" sx={{ ml: 0.5 }}>
          {currentLanguage?.toUpperCase()}
        </Typography>
      </IconButton>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "language-switcher-button",
        }}>
        {languages.map((lang) => (
          <MenuItem key={lang.code} selected={lang.code === currentLanguage} onClick={() => handleLanguageChange(lang.code as LanguageType)} sx={{ minWidth: 120 }}>
            <Box sx={{ mr: 1.5, fontSize: "1.2rem" }}>{lang.icon}</Box>
            {lang.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
