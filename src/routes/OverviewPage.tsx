import { Box } from "@mui/material";
import OrganizationSidebar from "../components/OverviewPage/OrganizationSidebar";
import PipelineAppBar from "../components/PipeLineComposer/PipelineAppBar";
import PipelineGrid from "../components/OverviewPage/PipelineGrid";
import { WidthFull } from "@mui/icons-material";

export default function UserPage() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Box sx={{ display: "flex" }}>
        <OrganizationSidebar />
        <PipelineGrid />
      </Box>
    </div>
  );
}
