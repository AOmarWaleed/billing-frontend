import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Badge,
  useTheme,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Secure from "../../shared/security";
import { AuthGuardContext } from "../../shared/core/AuthGuard";

interface CoverageDetailsProps {
  coverage: any;
  loading: boolean;
  error: string | null;
}

interface BenefitRowProps {
  benefit: any;
  index: number;
}

const BenefitRow: React.FC<BenefitRowProps> = ({ benefit, index }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const getCategoryIcon = () => {
    switch (benefit.category?.toLowerCase()) {
      case "hospitalization":
        return <LocalHospitalIcon fontSize="small" />;
      case "medication":
        return <MedicationIcon fontSize="small" />;
      case "consultation":
        return <DescriptionIcon fontSize="small" />;
      default:
        return <AttachMoneyIcon fontSize="small" />;
    }
  };

  const getCategoryColor = () => {
    switch (benefit.category?.toLowerCase()) {
      case "hospitalization":
        return theme.palette.primary.main;
      case "medication":
        return theme.palette.success.main;
      case "consultation":
        return theme.palette.info.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          backgroundColor:
            index % 2 === 0 ? theme.palette.action.hover : "inherit",
          "&:hover": { backgroundColor: theme.palette.action.selected },
        }}
      >
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            {getCategoryIcon()}
            <Typography variant="body2" fontWeight={500}>
              {benefit.name || " "}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={benefit.category || "Uncategorized"}
            size="small"
            sx={{
              backgroundColor: getCategoryColor(),
              color: theme.palette.getContrastText(getCategoryColor()),
              fontWeight: 500,
            }}
          />
        </TableCell>
        <TableCell>
          {benefit.excluded ? (
            <Chip
              icon={<BlockIcon />}
              label="Excluded"
              size="small"
              color="error"
              variant="outlined"
            />
          ) : (
            <Chip
              icon={<CheckCircleOutlineIcon />}
              label="Included"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </TableCell>
        <TableCell align="right">
          {benefit.copay_percent ? (
            <Typography variant="body2" fontWeight={500}>
              {benefit.copay_percent}%
            </Typography>
          ) : (
            " "
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
                padding: 2,
                backgroundColor: theme.palette.background.default,
                borderRadius: 1,
                borderLeft: `3px solid ${getCategoryColor()}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    DESCRIPTION
                  </Typography>
                  <Typography variant="body2">
                    {benefit.description || "No description available"}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    NETWORK
                  </Typography>
                  <Typography variant="body2">
                    {benefit.network || " "}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    ROOM TYPE
                  </Typography>
                  <Typography variant="body2">{benefit.room || " "}</Typography>
                </Grid>

                <Grid item xs={4} md={2}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    UNIT
                  </Typography>
                  <Typography variant="body2">{benefit.unit || " "}</Typography>
                </Grid>

                <Grid item xs={4} md={2}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    TERM
                  </Typography>
                  <Typography variant="body2">{benefit.term || " "}</Typography>
                </Grid>

                <Grid item xs={4} md={2}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    APPROVAL LIMIT
                  </Typography>
                  <Typography variant="body2">
                    {benefit.approval_limit || " "}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    COPAY MAXIMUM
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {benefit.copay_maximum || " "}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const CoverageDetails: React.FC<CoverageDetailsProps> = ({
  coverage,
  loading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const { t } = useContext(AuthGuardContext);
  if (error || !coverage || Object.keys(coverage).length === 0) {
    return (
      <Box sx={{ p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
        <Secure.GLTypography resource_key="patients_20_noCoverageDataAvailable" />
      </Box>
    );
  }
  console.log("coverage:", coverage);

  // Format date strings
  const formatDate = (dateString: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString() : " ";
  };

  // Calculate benefit statistics
  const benefitStats = {
    total: coverage.benefits?.length || 0,
    included: coverage.benefits?.filter((b: any) => !b.excluded).length || 0,
    excluded: coverage.benefits?.filter((b: any) => b.excluded).length || 0,
    categories: Array.from(
      new Set(
        coverage.benefits?.map((b: any) => b.category || "Uncategorized") || []
      )
    ),
  };

  // REVERTED: Original light background colors for each section
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
      title: t("patients_20_basicInfo"),
      icon: <DescriptionIcon fontSize="small" />,
      fields: [
        { label: t("patients_20_coverageId"), value: coverage.coverage_id },
        { label: t("patients_20_memberId"), value: coverage.member_id || " " },
        {
          label: t("patients_20_statusCovarage"),
          value: coverage.member_status,
        },
      ],
    },
    {
      title: t("patients_20_payerInfo"),
      icon: <AttachMoneyIcon fontSize="small" />,
      fields: [
        { label: t("patients_20_payerCovarage"), value: coverage.payer_name },
        { label: t("patients_20_license"), value: coverage.payer_lic },
        { label: t("patients_20_network"), value: coverage.network || " " },
      ],
    },
    {
      title: t("patients_20_coveragePeriod"),
      icon: <MedicationIcon fontSize="small" />,
      fields: [
        {
          label: t("patients_20_start"),
          value: formatDate(coverage.serviced_period_start),
        },
        {
          label: t("patients_20_end"),
          value: formatDate(coverage.serviced_period_end),
        },
        { label: t("patients_20_inforce"), value: coverage.inforce },
      ],
    },
    {
      title: t("patients_20_policyInfo"),
      icon: <DescriptionIcon fontSize="small" />,
      fields: [
        {
          label: t("patients_20_policyNumber"),
          value: coverage.policy_number || " ",
        },
        {
          label: t("patients_20_holder"),
          value: coverage.policy_holder || " ",
        },
        { label: t("patients_20_type"), value: coverage.coverage_type || " " },
      ],
    },
    {
      title: t("patients_20_financials"),
      icon: <AttachMoneyIcon fontSize="small" />,
      fields: [
        {
          label: t("patients_20_copayPercent"),
          value: coverage.copay_percent ? `${coverage.copay_percent}%` : " ",
        },
        { label: t("patients_20_copayMax"), value: coverage.copay_max || " " },
        { label: t("patients_20_class"), value: coverage.class_name || " " },
      ],
    },
  ];

  return (
    <Box
      sx={{
        p: 1,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Secure.GLTypography
          resource_key="patients_20_coverageDetailsCoverageDetail"
          variant="h6"
          fontWeight="bold"
        />

        <Box display="flex" gap={1}>
          <Chip
            label={`${benefitStats.included} ${t(
              "patients_20_includedCoverageDetail"
            )}`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${benefitStats.excluded} ${t(
              "patients_20_excludedCoverageDetail"
            )}`}
            color="error"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${benefitStats.categories.length} ${t(
              "patients_20_categoriesCoverageDetail"
            )}`}
            color="info"
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      <Grid container spacing={1} mb={3}>
        {coverageSections.map((section, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={section.title}>
            <Box
              sx={{
                backgroundColor: sectionColors[index % sectionColors.length],
                p: 1.5,
                borderRadius: 1,
                height: "100%",
                transition: "background-color 0.3s ease", // Keep only background transition
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Original hover effect
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {section.icon}
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{
                    color: theme.palette.text.primary,
                  }}
                >
                  {section.title}
                </Typography>
              </Box>

              {section.fields.map((field) => (
                <Box key={field.label} sx={{ mb: 1 }}>
                  <Typography
                    variant="caption"
                    fontWeight="medium"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {field.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {field.value || " "}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Benefits Section */}
      <Box mt={3}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab
            label={
              <Badge badgeContent={benefitStats.total} color="primary">
                <Secure.GLTypography resource_key="patients_20_coverageBenefits" />
              </Badge>
            }
          />
        </Tabs>

        {coverage.benefits && coverage.benefits.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 500,
              overflow: "auto",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width="5%" />
                  <Secure.GLTableCell resource_key="patients_20_benefit" />
                  <Secure.GLTableCell resource_key="patients_20_category" />
                  <Secure.GLTableCell resource_key="patients_20_statusCovarageSection" />
                  <Secure.GLTableCell
                    align="right"
                    resource_key="patients_20_copay"
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {coverage.benefits.map((benefit: any, index: number) => (
                  <BenefitRow
                    key={benefit.benefit_id}
                    benefit={benefit}
                    index={index}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: theme.palette.background.default,
              borderRadius: 1,
              border: `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Secure.GLTypography
              variant="body1"
              color="textSecondary"
              resource_key="patients_20_noBenefitsAvailableForThisCoverage"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CoverageDetails;
