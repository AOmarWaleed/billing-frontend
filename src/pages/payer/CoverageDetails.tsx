import React, { useContext } from "react";
import { Box, Typography, Grid, CircularProgress, Alert } from "@mui/material";
import { AuthGuardContext } from "../../shared/core/AuthGuard";

interface CoverageDetailsProps {
  coverage: any;
  loading: boolean;
  error: string | null;
}

const CoverageDetails: React.FC<CoverageDetailsProps> = ({ coverage, loading, error }) => {
  // Get translation context
  const ctx = useContext(AuthGuardContext);
  if (!ctx) {
    return null;
  }
  const { t } = ctx;

  if (error || !coverage || Object.keys(coverage).length === 0) {
    return (
      <Box sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
        <Typography>{t("payers_7_NoCoverageData") || "No coverage data available"}</Typography>
      </Box>
    );
  }

  // Format date strings
  const formatDate = (dateString: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString() : " ";
  };

  // Light background colors for each section
  const sectionColors = [
    "#e3f2fd", // Very light blue
    "#e8f5e9", // Very light green
    "#fff3e0", // Very light orange
    "#f3e5f5", // Very light purple
    "#ffebee", // Very light pink
  ];

  // Organize data into compact sections
  const coverageSections = [
    {
      title: t("payers_7_CoverageBasicInfo") || "Basic Info",
      fields: [
        { label: t("payers_7_CoverageCoverageID") || "Coverage ID", value: coverage.coverage_id },
        { label: t("payers_7_CoverageMemberID") || "Member ID", value: coverage.member_id || " " },
        { label: t("payers_7_CoverageStatus") || "Status", value: coverage.member_status },
      ],
    },
    {
      title: t("payers_7_CoveragePayerInfo") || "Payer Info",
      fields: [
        { label: t("payers_7_CoveragePayer") || "Payer", value: coverage.payer_name },
        { label: t("payers_7_CoverageLicense") || "License", value: coverage.payer_lic },
        { label: t("payers_7_CoverageNetwork") || "Network", value: coverage.network || " " },
      ],
    },
    {
      title: t("payers_7_CoveragePeriod") || "Coverage Period",
      fields: [
        { label: t("payers_7_CoverageStart") || "Start", value: formatDate(coverage.serviced_period_start) },
        { label: t("payers_7_CoverageEnd") || "End", value: formatDate(coverage.serviced_period_end) },
        { label: t("payers_7_CoverageInforce") || "Inforce", value: coverage.inforce },
      ],
    },
    {
      title: t("payers_7_CoveragePolicyInfo") || "Policy Info",
      fields: [
        { label: t("payers_7_CoveragePolicyNumber") || "Policy #", value: coverage.policy_number || " " },
        { label: t("payers_7_CoveragePolicyHolder") || "Holder", value: coverage.policy_holder || " " },
        { label: t("payers_7_CoverageCoverageType") || "Type", value: coverage.coverage_type || " " },
      ],
    },
    {
      title: t("payers_7_CoverageFinancials") || "Financials",
      fields: [
        { label: t("payers_7_CoverageCopayPercent") || "Copay %", value: coverage.copay_percent ? `${coverage.copay_percent}%` : " " },
        { label: t("payers_7_CoverageCopayMax") || "Copay Max", value: coverage.copay_max || " " },
        { label: t("payers_7_CoverageClass") || "Class", value: coverage.class_name || " " },
      ],
    },
  ];

  return (
    <Box sx={{ p: 1, border: "1px solid #eee", borderRadius: 1 }}>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        {t("payers_7_CoverageDetailsTitle") || "Coverage Details"}
      </Typography>

      <Grid container spacing={1}>
        {coverageSections.map((section, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={section.title}>
            <Box
              sx={{
                backgroundColor: sectionColors[index % sectionColors.length],
                p: 1,
                borderRadius: 1,
                height: "100%",
                transition: "background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                },
              }}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                mb={0.5}
                sx={{
                  color: "#333",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                  pb: 0.5,
                }}>
                {section.title}
              </Typography>

              {section.fields.map((field) => (
                <Box key={field.label} sx={{ mb: 0.5 }}>
                  <Typography variant="caption" fontWeight="medium" sx={{ color: "#555" }}>
                    {field.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#222" }}>
                    {field.value || " "}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CoverageDetails;
