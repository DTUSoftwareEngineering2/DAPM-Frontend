import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import PipelineCard from "./PipelineCard";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { addNewPipeline, setImageData, deletePipeline, duplicatePipeline } from "../../redux/slices/pipelineSlice";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPipelines } from "../../redux/selectors";
import FlowDiagram from "./ImageGeneration/FlowDiagram";
import ReactDOM from "react-dom";
import { toPng } from "html-to-image";
import { getNodesBounds, getViewportForBounds } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { getDataSinks, getResources } from "../../redux/selectors/apiSelector";
import { fetchRepositoryResources } from "../../services/backendAPI";
import { downloadResource } from "../../services/backendAPI";
import { useEffect, useState } from "react";
import { OutputFile } from "./PipelineCard";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const exampleOutputs = [
  {
    name: "raw_event_log.txt",
    content: "This is the raw event log data...\nTimestamp: 2024-01-01 12:00:00\nEvent: Start Process\n...",
  },
  {
    name: "filtered_cleaned_log.txt",
    content: "This is the filtered and cleaned log data...\nTimestamp: 2024-01-01 12:05:00\nEvent: Cleaned Entry\n...",
  },
  {
    name: "activity_mappings_output.txt",
    content: "Activity mappings:\nActivity A -> Step 1\nActivity B -> Step 2\n...",
  },
  {
    name: "dependency_graph_intermediate.txt",
    content: "Intermediate dependency graph representation:\nNode A -> Node B\nNode B -> Node C\n...",
  },
  {
    name: "final_conformance_summary.txt",
    content: "Final conformance summary:\nTotal conformance: 95%\nDeviations: 5%\n...",
  }
];

export default function AutoGrid() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const pipelines = useSelector(getPipelines);
  const [anchorElMap, setAnchorElMap] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleMenuClick = (id: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMap((prev) => ({ ...prev, [id]: event.currentTarget }));
  };

  const handleClose = (id: string) => {
    setAnchorElMap((prev) => ({ ...prev, [id]: null }));
  };

  const handleDelete = (pipelineId: string) => {
    dispatch(deletePipeline(pipelineId));  // Dispatch the delete action
    setAnchorElMap((prev) => ({ ...prev, [pipelineId]: null }));  // Close the menu
  }

  const handleDuplicate = (pipelineId: string) => {
    dispatch(duplicatePipeline(pipelineId)); // Dispatch the duplicate action
    setAnchorElMap((prev) => ({ ...prev, [pipelineId]: null }));  // Close the menu
  };

  const createNewPipeline = () => {
    dispatch(
      addNewPipeline({
        id: `pipeline-${uuidv4()}`,
        flowData: { nodes: [], edges: [] },
      })
    );
    {
      navigate("/pipeline");
    }
  };

  pipelines.map(({ pipeline: flowData, id, name }) => {
    const nodes = flowData.nodes;
    const edges = flowData.edges;
    //console.log(name, nodes, edges);
    const pipelineId = id;
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-10000px";
    container.id = pipelineId;
    document.body.appendChild(container);

    ReactDOM.render(
      <FlowDiagram nodes={nodes} edges={edges} />,
      container,
      () => {
        const width = 800;
        const height = 600;

        const nodesBounds = getNodesBounds(nodes!);
        const { x, y, zoom } = getViewportForBounds(
          nodesBounds,
          width,
          height,
          0.5,
          2,
          1
        );

        toPng(
          document.querySelector(
            `#${pipelineId} .react-flow__viewport`
          ) as HTMLElement,
          {
            backgroundColor: "#333",
            width: width,
            height: height,
            style: {
              width: `${width}`,
              height: `${height}`,
              transform: `translate(${x}px, ${y}px) scale(${zoom})`,
            },
          }
        ).then((dataUrl) => {
          dispatch(setImageData({ id: pipelineId, imgData: dataUrl }));
          document.body.removeChild(container);
        });
      }
    );
  });

  const dataSinks = useSelector(getDataSinks);
  const resources = useSelector(getResources);

  function getPipelineOutput() {
    if (!dataSinks) return [];

    /*return dataSinks.map((dataSink) => {
      const orgId = dataSink.data.instantiationData.resource.organizationId;
      const repoId = dataSink.data.instantiationData.resource.repositoryId;
      const filename = dataSink.data.instantiationData.resource.name;
      console.log(resources);
      const resource = resources.find((resource) => resource.organizationId === orgId && resource.repositoryId === repoId && resource.name === filename);
      const resourceId = resource ? resource.id : "not found";
      return [`orgId : ${orgId}, repoId : ${repoId}, fileName : ${filename}, resource_Id : ${resourceId}`];
    });*/


    const outputPromises = dataSinks.map(async (dataSink) => {
      const orgId = dataSink.data.instantiationData.resource.organizationId;
      const repoId = dataSink.data.instantiationData.resource.repositoryId;
      const filename = dataSink.data.instantiationData.resource.name;

      const resource = resources.find((resource) =>
        resource.organizationId === orgId &&
        resource.repositoryId === repoId &&
        resource.name === filename
      );

      if (!resource) {
        return {
          name: filename,
          content: "Resource not found"
        };
      }

      try {
        const downloadResponse = await downloadResource(orgId, repoId, resource.id);
        const fileContent = await downloadResponse.text();

        return {
          name: filename,
          content: fileContent
        };
      } catch (error) {
        console.error(`Error downloading resource ${filename}:`, error);
        return {
          name: filename,
          content: `Error downloading file`
        };
      }
    });

    return Promise.all(outputPromises);
  }

  const [outputs, setOutputs] = useState<OutputFile[]>([]);

  useEffect(() => {
    const fetchOutputs = async () => {
      const results = await getPipelineOutput();
      setOutputs(results);
    };

    fetchOutputs();
  }, [dataSinks, resources]);


  return (
    <Box sx={{ flexGrow: 1, flexBasis: "100%" }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => createNewPipeline()}
        sx={{
          backgroundColor: "#bbb",
          "&:hover": { backgroundColor: "#eee" },
          marginBlockStart: "10px",
        }}
      >
        Create New
      </Button>
      <Grid container spacing={{ xs: 1, md: 1 }} sx={{ padding: "10px" }}>
        {
          pipelines.map(({ id, name, imgData }) => {
            const open = Boolean(anchorElMap[id]);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={id}>
                <Paper elevation={3} sx={{ position: "relative" }}>
                  <IconButton
                    aria-label="more options"
                    onClick={(event) => handleMenuClick(id, event)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1000,
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  {/* <span>Menu Button Here</span> */}
                  <Menu
                    anchorEl={anchorElMap[id]}
                    open={open}
                    onClose={() => handleClose(id)}
                    PaperProps={{
                      style: {
                        width: '150px',
                      },
                    }}
                  >
                    {/* <MenuItem onClick={() => handleClose(id)}>Rename</MenuItem> */}
                    <MenuItem onClick={() => handleDuplicate(id)}>Duplicate</MenuItem>
                    <MenuItem
                      onClick={() => handleDelete(id)}
                      sx={{ color: 'red' }}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                  <PipelineCard
                    id={id}
                    name={name}
                    imgData={imgData}
                    status={"completed"}
                    outputs={outputs}
                  ></PipelineCard>

                </Paper>
              </Grid>
            );
          })
        }

      </Grid >
    </Box >
  );
}
