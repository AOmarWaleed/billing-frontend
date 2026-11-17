import { Grid2 as Grid } from "@mui/material";
import BedClassMaster from "./components/BedClassMaster";
import BedClassService from "./components/BedClassService";
import HandleTitle from "../../components/HandleTitle/HandleTitle";
export default function BedClass() {
  return (
    <Grid container spacing={1} justifyContent={"space-between"}>
      <HandleTitle titleKey="BED_CLASSES" />
      {/* BedClass Component */}
      <Grid size={{ xs: 12, md: 4 }}>
        <BedClassMaster />
      </Grid>
      {/* Detail(services) Component */}
      <Grid size={{ xs: 12, md: 7.8 }}>
        <BedClassService />
      </Grid>
    </Grid>
  );
}
