import { AppBar, Box, Button, TextField, Toolbar, Typography, Modal, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getActiveFlowData, getActivePipeline } from "../../redux/selectors";
import React, { useState, useEffect, useContext } from "react";
import { setDataSinks, updatePipelineName } from "../../redux/slices/pipelineSlice";
import EditIcon from "@mui/icons-material/Edit";
import { Node } from "reactflow";
import {
  DataSinkNodeData,
  DataSourceNodeData,
  OperatorNodeData,
} from "../../redux/states/pipelineState";
import {
  putCommandStart,
  putExecution,
  putPipeline,
} from "../../services/backendAPI";
import {
  getOrganizations,
  getRepositories,
} from "../../redux/selectors/apiSelector";
import { getHandleId, getNodeId } from "./Flow";
import AuthContext from "../../context/AuthProvider";
import { User, getUserInfo } from "../../redux/userStatus"

// Table columns data
const tableColumns = ["Not running", "Running", "Completed"];

const mockExecutionHistory = [
  { time: "2024-11-20 14:00:00", status: "Completed", files: "output1.txt, output2.txt" },
  { time: "2024-11-19 10:30:00", status: "Running", files: "output_temp.txt" },
  { time: "2024-11-18 09:15:00", status: "Failed", files: "none" },
];

export interface OutputFile {
  name: string; // File name, e.g., "raw_event_log.txt"
  content: string; // File content
}

const exampleOutputs: OutputFile[] = [
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
  },
];

const downloadFile = (fileName: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

const downloadAllFiles = () => {
  // outputs.forEach(output => {
  exampleOutputs.forEach(output => {
    downloadFile(output.name, output.content);  // Downloads each file individually
  });
};

export default function PipelineAppBar() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);

  const [isTableOpen, setIsTableOpen] = useState(false);

  const [open, setOpen] = React.useState(false);  // State to control dialog open/close
  const [outputs, setOutputs] = useState([]);  
  const [executionHistoryOpen, setExecutionHistoryOpen] = useState(false);

  const toggleTable = () => {
    setIsTableOpen((prev) => !prev);
  };

  const handleCloseTable = () => {
    setIsTableOpen(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  const handleDialogOpen = (event: React.MouseEvent) => {
    event.stopPropagation();  // Prevent triggering the navigation when clicking the smaller button
    setOpen(true);  // Set the dialog state to true (open)
  };
  
  const handleDialogClose = () => {
    setOpen(false);  // Set the dialog state to false (close)
  };

  const organizations = useSelector(getOrganizations);
  const repositories = useSelector(getRepositories);

  const pipelineName = useSelector(getActivePipeline)?.name;

  const setPipelineName = (name: string) => {
    dispatch(updatePipelineName(name));
  };

  const flowData = useSelector(getActiveFlowData);

  const [history, setHistory] = useState<{ timestamp: string; data: any }[]>([]);


  const generateJson = async () => {
    //console.log(flowData)

    // @s242147 and @s241747 : Added property fileName in the edges to get the filename of the data in the dataSink
    var edges = flowData!.edges.map((edge) => {
      return {
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        data : edge.data?.filename
      };
    });

    console.log("copied", edges);

    const dataSinks = flowData?.edges
      .map((edge) => {
        if (edge.data?.filename) {
          const newTarget = getHandleId();
          const egeToModify = edges.find(
            (e) =>
              e.sourceHandle == edge.sourceHandle &&
              e.targetHandle == edge.targetHandle
          );
          egeToModify!.targetHandle = newTarget;

          const originalDataSink = flowData!.nodes.find(
            (node) => node.id === edge.target
          ) as Node<DataSinkNodeData>;
          return {
            type: originalDataSink?.type,
            data: {
              ...originalDataSink?.data,
              templateData: {
                sourceHandles: [],
                targetHandles: [{ id: newTarget }],
              },
              instantiationData: {
                resource: {
                  //...originalDataSink?.data?.instantiationData.repository,
                  organizationId:
                    originalDataSink?.data?.instantiationData.repository
                      ?.organizationId,
                  repositoryId:
                    originalDataSink?.data?.instantiationData.repository?.id,
                  name: edge?.data?.filename,
                },
              },
            },
            position: { x: 100, y: 100 },
            id: getNodeId(),
            width: 100,
            height: 100,
          };
        }
      })
      .filter((node) => node !== undefined) as any;

    // s242147 and s241747 : Set the property of DataSinks, unique to each pipeline so it can be accessed from another file
    dispatch(setDataSinks(dataSinks));
    console.log(JSON.stringify(dataSinks));

    const requestData = {
      name: pipelineName,
      pipeline: {
        nodes: flowData?.nodes
          ?.filter((node) => node.type === "dataSource")
          .map((node) => node as Node<DataSourceNodeData>)
          .map((node) => {
            return {
              type: node.type,
              data: {
                ...node.data,
                instantiationData: {
                  resource: {
                    //...node?.data?.instantiationData.resource,
                    organizationId:
                      node?.data?.instantiationData.resource?.organizationId,
                    repositoryId:
                      node?.data?.instantiationData.resource?.repositoryId,
                    resourceId: node?.data?.instantiationData.resource?.id,
                  },
                },
              },
              width: 100,
              height: 100,
              position: { x: 100, y: 100 },
              id: node.id,
              label: "",
            } as any;
          })
          .concat(
            flowData?.nodes
              ?.filter((node) => node.type === "operator")
              .map((node) => node as Node<OperatorNodeData>)
              .map((node) => {
                return {
                  type: node.type,
                  data: {
                    ...node.data,
                    instantiationData: {
                      resource: {
                        //...node?.data?.instantiationData.algorithm,
                        organizationId:
                          node?.data?.instantiationData.algorithm
                            ?.organizationId,
                        repositoryId:
                          node?.data?.instantiationData.algorithm?.repositoryId,
                        resourceId: node?.data?.instantiationData.algorithm?.id,
                      },
                    },
                  },
                  width: 100,
                  height: 100,
                  position: { x: 100, y: 100 },
                  id: node.id,
                  label: "",
                } as any;
              })
          )
          .concat(dataSinks),
        edges: edges.map((edge) => {
          return {
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            data : edge.data,
          };
        }),
      },
    };

    // Set history to stock the new call
    setHistory((prevHistory) => [
      ...prevHistory,
      { timestamp: new Date().toISOString(), data: requestData },
    ]);

    console.log(JSON.stringify(requestData));

    const selectedOrg = organizations[0];
    const selectedRepo = repositories.filter(
      (repo) => repo.organizationId === selectedOrg.id
    )[0];

    const pipelineId = await putPipeline(
      selectedOrg.id,
      selectedRepo.id,
      requestData
    );
    const executionId = await putExecution(
      selectedOrg.id,
      selectedRepo.id,
      pipelineId
    );
    await putCommandStart(
      selectedOrg.id,
      selectedRepo.id,
      pipelineId,
      executionId
    );
  };

  const [user, setUser] = useState<User | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (auth?.accessToken) {
      getUserInfo(auth.accessToken).then(userInfo => setUser(userInfo));
    }
  }, []);

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ flexGrow: 1 }}>
        <Button onClick={() => navigate("/")}>
          <ArrowBackIosNewIcon sx={{ color: "white" }} />
        </Button>
        <Box sx={{ width: "100%", textAlign: "center" }}>
          {isEditing ? (
            <TextField
              value={pipelineName}
              onChange={(event) =>
                setPipelineName(event?.target.value as string)
              }
              autoFocus
              onBlur={handleFinishEditing}
              inputProps={{ style: { textAlign: "center", width: "auto" } }}
            />
          ) : (
            <Box
              onClick={handleStartEditing}
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Typography>{pipelineName}</Typography>
              <EditIcon sx={{ paddingLeft: "10px" }} />
            </Box>
          )}
        </Box>
        < Box sx={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <Button onClick={toggleTable} sx={{ marginRight: '20px' }}>
            <Typography variant="body1" sx={{ color: "white" }}>Show Status</Typography>
          </Button>
          <Button onClick={handleDialogOpen} sx={{ marginRight: '20px' }}>
            <Typography variant="body1" sx={{ color: "white" }}>View Outputs</Typography>
          </Button>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
              <Button
                className="status-circle"
                variant="contained"
                color="info"
                onClick={() => user && setSelectedUser(user)}
                sx={user ? {
                  width: '43px',
                  height: '43px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  minWidth: 'auto',
                  padding: 0,
                } : {}}
              >
                {user ? (user.firstName[0] + user.lastName[0]).toUpperCase() : ''}
              </Button>
            </Box>
          ) : null}
        </Box>
        <Button onClick={() => setExecutionHistoryOpen(true)} color="primary" variant="outlined">
          View History
        </Button>
        <Button onClick={() => generateJson()}>
          <Typography variant="body1" sx={{ color: "white" }}>
            Deploy pipeline
          </Typography>
        </Button>
      </Toolbar >

      {/* Execution History Dialog */}
      <Dialog 
        open={executionHistoryOpen} 
        onClose={() => setExecutionHistoryOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Execution History</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date/Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Output Files</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockExecutionHistory.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.time}</TableCell>
                    <TableCell>{entry.status}</TableCell>
                    <TableCell>{entry.files}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecutionHistoryOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pipeline Outputs Dialog */}
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Pipeline Outputs</Typography>
          <Button onClick={downloadAllFiles} color="primary" variant="outlined">
            Download All
          </Button>
        </DialogTitle>
        <DialogContent>
          {/* {outputs.map((output, index) => ( */}
          {exampleOutputs.map((output, index) => (
            <Grid container key={index} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={8}>
                <Typography>{output.name}</Typography>
              </Grid>
              <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => downloadFile(output.name, output.content)} 
                  color="primary"
                  variant="outlined"
                >
                  Download
                </Button>
              </Grid>
            </Grid>
          ))}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={handleDialogClose} color="primary" variant="text">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Table Modal */}
      <Modal
        open={isTableOpen}
        onClose={handleCloseTable}
        aria-labelledby="status-table-modal"
        aria-describedby="status-table-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="status-table-modal" variant="h6" component="h2" sx={{ mb: 2 }}>
            Pipeline Status
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Not running</TableCell>
                  <TableCell>Running</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {/* Add content for 'Not running' column */}
                  </TableCell>
                  <TableCell>
                    {/* Add content for 'Running' column */}
                  </TableCell>
                  <TableCell>
                    {/* Add content for 'Completed' column */}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Button onClick={handleCloseTable} sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal >

      {
        selectedUser && (
          <Box
            sx={{
              position: 'absolute',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#202020',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: '10px' }}> {selectedUser.firstName + " " + selectedUser.lastName}</Typography>
            <Typography variant="body1"><strong>ID :</strong> {selectedUser.id}</Typography>
            <Typography variant="body1"><strong>Status :</strong> {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}</Typography>
            <Typography variant="body1"><strong>Organization :</strong> {selectedUser.organizationid}</Typography>
            <Typography variant="body1"><strong>Email :</strong> {selectedUser.email}</Typography>
            <Button onClick={logout} sx={{ marginTop: '10px', marginLeft: '10px' }} color="error">Log Out</Button>
            <Button onClick={() => setSelectedUser(null)} sx={{ marginTop: '10px' }}>Close</Button>
          </Box>
        )
      }
    </AppBar >
  );
}
