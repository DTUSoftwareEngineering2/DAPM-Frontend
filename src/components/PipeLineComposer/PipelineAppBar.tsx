import { AppBar, Box, Button, TextField, Toolbar, Typography } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getActiveFlowData, getActivePipeline } from "../../redux/selectors";
import { useState, useEffect, useContext } from "react";
import { updatePipelineName } from "../../redux/slices/pipelineSlice";
import EditIcon from '@mui/icons-material/Edit';
import { Node } from "reactflow";
import { DataSinkNodeData, DataSourceNodeData, OperatorNodeData } from "../../redux/states/pipelineState";
import { putCommandStart, putExecution, putPipeline } from "../../services/backendAPI";
import { getOrganizations, getRepositories } from "../../redux/selectors/apiSelector";
import { getHandleId, getNodeId } from "./Flow";
import { fetchUserInfo } from "../../services/backendAPI";
import AuthContext from "../../context/AuthProvider";

export default function PipelineAppBar() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  const organizations = useSelector(getOrganizations)
  const repositories = useSelector(getRepositories)

  const pipelineName = useSelector(getActivePipeline)?.name

  const setPipelineName = (name: string) => {
    dispatch(updatePipelineName(name))
  }

  const flowData = useSelector(getActiveFlowData)

  const generateJson = async () => {

    //console.log(flowData)

    var edges = flowData!.edges.map(edge => {
      return { sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle }
    })

    console.log("copied", edges)

    const dataSinks = flowData?.edges.map((edge) => {
      if (edge.data?.filename) {
        const newTarget = getHandleId()
        const egeToModify = edges.find(e => e.sourceHandle == edge.sourceHandle && e.targetHandle == edge.targetHandle)
        egeToModify!.targetHandle = newTarget

        const originalDataSink = flowData!.nodes.find(node => node.id === edge.target) as Node<DataSinkNodeData>
        return {
          type: originalDataSink?.type,
          data: {
            ...originalDataSink?.data,
            templateData: { sourceHandles: [], targetHandles: [{ id: newTarget }] },
            instantiationData: {
              resource: {
                //...originalDataSink?.data?.instantiationData.repository, 
                organizationId: originalDataSink?.data?.instantiationData.repository?.organizationId,
                repositoryId: originalDataSink?.data?.instantiationData.repository?.id,
                name: edge?.data?.filename
              }
            }
          },
          position: { x: 100, y: 100 },
          id: getNodeId(),
          width: 100,
          height: 100,
        }
      }
    }).filter(node => node !== undefined) as any

    console.log(JSON.stringify(dataSinks))

    const requestData = {
      name: pipelineName,
      pipeline: {
        nodes: flowData?.nodes?.filter(node => node.type === 'dataSource').map(node => node as Node<DataSourceNodeData>).map(node => {
          return {
            type: node.type,
            data: {
              ...node.data,
              instantiationData: {
                resource: {
                  //...node?.data?.instantiationData.resource,
                  organizationId: node?.data?.instantiationData.resource?.organizationId,
                  repositoryId: node?.data?.instantiationData.resource?.repositoryId,
                  resourceId: node?.data?.instantiationData.resource?.id,
                },
              }
            },
            width: 100, height: 100, position: { x: 100, y: 100 }, id: node.id, label: "",
          } as any
        }).concat(
          flowData?.nodes?.filter(node => node.type === 'operator').map(node => node as Node<OperatorNodeData>).map(node => {
            return {
              type: node.type, data: {
                ...node.data,
                instantiationData: {
                  resource: {
                    //...node?.data?.instantiationData.algorithm,
                    organizationId: node?.data?.instantiationData.algorithm?.organizationId,
                    repositoryId: node?.data?.instantiationData.algorithm?.repositoryId,
                    resourceId: node?.data?.instantiationData.algorithm?.id,
                  }
                }
              },
              width: 100, height: 100, position: { x: 100, y: 100 }, id: node.id, label: "",
            } as any
          })
        ).concat(dataSinks),
        edges: edges.map(edge => {
          return { sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle }
        })
      }
    }

    console.log(JSON.stringify(requestData))

    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    const pipelineId = await putPipeline(selectedOrg.id, selectedRepo.id, requestData)
    const executionId = await putExecution(selectedOrg.id, selectedRepo.id, pipelineId)
    await putCommandStart(selectedOrg.id, selectedRepo.id, pipelineId, executionId)

  }

  // USER STATUS

  interface User {
    id: number;
    name: string;
    status: string;
    organizationid: number;
    email: string;
  }

  const [user, setUser] = useState<User>({
    id: 0,
    name: "NAME",
    status: "STATUS",
    organizationid: 0,
    email: "EM@IL"
  });

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    fetchAndSetUserInfo()
  };

  const fetchAndSetUserInfo = async () => {
    try {
      var accessToken = "";
      if (auth?.accesstoken) {
        accessToken = auth.accesstoken;
      }
      console.log("USER TOCKET");
      console.log(auth.accesstoken);

      const data = await fetchUserInfo(accessToken);
      const updatedUser = {
        id: data.userId,
        name: data.firstName + " " + data.lastName,
        status: "online",
        organizationid: data.organizationId,
        email: data.email,
      };
      console.log(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error fetching user information:', error);
      // Default User in case of an error
      setUser({
        id: 1,
        name: "Alice",
        status: "online",
        organizationid: 101,
        email: "alice@dtu.dk"
      })
    }
  };

  const handleLogout = () => {
    setUser({ ...user, status: 'offline' });
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchAndSetUserInfo();
  }, []);

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ flexGrow: 1 }}>
        <Button onClick={() => navigate('/')}>
          <ArrowBackIosNewIcon sx={{ color: "white" }} />
        </Button>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          {isEditing ? (
            <TextField
              value={pipelineName}
              onChange={(event) => setPipelineName(event?.target.value as string)}
              autoFocus
              onBlur={handleFinishEditing}
              inputProps={{ style: { textAlign: 'center', width: 'auto' } }}
            />
          ) : (
            <Box onClick={handleStartEditing} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
              <Typography>{pipelineName}</Typography>
              <EditIcon sx={{ paddingLeft: '10px' }} />
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <Box
            key={user.id}
            sx={{ display: 'flex', alignItems: 'center', marginRight: '15px', cursor: 'pointer' }}
            onClick={() => handleUserClick(user)}
          >
            <Box
              className="status-circle"
              sx={{
                width: '43px',
                height: '43px',
                borderRadius: '50%',
                backgroundColor:
                  user.status === 'online' ? '#4CAF50' :
                    user.status === 'away' ? '#FFC107' :
                      '#F44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              {getInitials(user.name)}
            </Box>
          </Box>
        </Box>
        <Button onClick={() => generateJson()}>
          <Typography variant="body1" sx={{ color: "white" }}>Deploy pipeline</Typography>
        </Button>
      </Toolbar>
      {selectedUser && (
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
          <Typography variant="h6" sx={{ marginBottom: '10px' }}> {selectedUser.name}</Typography>
          <Typography variant="body1"><strong>ID :</strong> {selectedUser.id}</Typography>
          <Typography variant="body1"><strong>Status :</strong> {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}</Typography>
          <Typography variant="body1"><strong>Organization :</strong> {selectedUser.organizationid}</Typography>
          <Typography variant="body1"><strong>Email :</strong> {selectedUser.email}</Typography>
          <Button onClick={() => handleLogout()} sx={{ marginTop: '10px', marginLeft: '10px' }} color="error">Log Out</Button>
          <Button onClick={() => setSelectedUser(null)} sx={{ marginTop: '10px' }}>Fermer</Button>
        </Box>
      )}
    </AppBar>
  )
}
