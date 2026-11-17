import React from "react";
import { Card, CardContent, Typography, Stack, Divider, Box } from "@mui/material";
import { grey } from "@mui/material/colors";

interface GenericCardViewProps<T> {
  data: T;
  fields: {
    key: keyof T;
    label: string;
    width?: number | string;
    transform?: (value: any) => string | React.ReactNode;
  }[];
  direction?: "row" | "column";
  theme?: "light" | "dark";
  divider?: boolean;
}

const GenericCardView = <T extends Record<string, any>>({ data, fields, direction = "row", theme = "light", divider = true }: GenericCardViewProps<T>) => {
  const cardStyles = {
    light: {
      background: "none",
      border: "none",
      margin: 0,
      padding: 0,
      "&:hover": {
        background: "none",
        border: "none",
      },
    },
    dark: {
      background: "none",
      border: "none",
      margin: 0,
      padding: 0,
      backgroundColor: grey[900],
      "&:hover": {
        background: "none",
        border: "none",
      },
    },
  };

  return (
    <>
      <Card variant="outlined" sx={cardStyles[theme]}>
        <CardContent sx={{ padding: 0 }}>
          <Stack
            direction={direction}
            divider={direction === "row" ? <Divider orientation="vertical" flexItem /> : undefined}
            spacing={direction === "row" ? 1 : 0}
            sx={{
              overflow: "hidden",
              flexWrap: "nowrap",
              alignItems: direction === "row" ? "center" : "flex-start",
            }}>
            {fields.map((field) => (
              <Box
                key={field.key as string}
                sx={{
                  flex: field.width || 1,
                  minWidth: 0, // Ensures text truncation works
                  py: direction === "column" ? 0.5 : 0,
                }}>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: theme === "dark" ? grey[400] : grey[700],
                  }}>
                  <span style={{ color: "GrayText" }}>{field.label}: </span>
                  {field.transform ? field.transform(data[field.key]) : data[field.key]}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
      {divider && <Divider />}
    </>
  );
};

export default GenericCardView;
