import { styled } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import {
  getOrganizations,
  getRepositories,
  getResources,
} from "../../redux/selectors/apiSelector";
import {
  organizationThunk,
  repositoryThunk,
  resourceThunk,
} from "../../redux/slices/apiSlice";
import {
  Organization,
  Repository,
  Resource,
} from "../../redux/states/apiState";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { Box, Button } from "@mui/material";
import ResourceUploadButton from "./Buttons/ResourceUploadButton";
import { downloadResource, fetchUsers } from "../../services/backendAPI";
import CreateRepositoryButton from "./Buttons/CreateRepositoryButton";
import AddOrganizationButton from "./Buttons/AddOrganizationButton";
import OperatorUploadButton from "./Buttons/OperatorUploadButton";
import { Padding } from "@mui/icons-material";
import AuthContext from "../../context/AuthProvider";
import { User, getUserInfo } from "../../redux/userStatus"

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function PersistentDrawerLeft() {
  const { auth, logout } = useContext(AuthContext);

  const dispatch = useAppDispatch();
  const organizations: Organization[] = useAppSelector(getOrganizations);
  const repositories: Repository[] = useAppSelector(getRepositories);
  const resources = useSelector(getResources);

  useEffect(() => {
    dispatch(organizationThunk());
    dispatch(repositoryThunk(organizations));
    dispatch(resourceThunk({ organizations, repositories }));
  }, [dispatch]);

  const handleDownload = async (resource: Resource) => {
    const response = await downloadResource(
      resource.organizationId,
      resource.repositoryId,
      resource.id
    );
    await downloadReadableStream(response.url, resource.name);
  };

  async function downloadReadableStream(url: string, fileName: string) {
    window.open(url, "_blank");
  }

  const [user, setUser] = useState<User | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);

  // Toggle display of users and fetch them if needed
  const handleShowUsers = () => {
    if (!showUsers && auth?.accessToken) {
      fetchUsers(auth.accessToken).then((fetchedUsers) => {
        // Check if fetchedUsers has a 'data' property that contains the users array

        const userArray = []

        console.log("coucou")
        console.log(fetchedUsers)
        console.log("end")

        userArray[0] = {
            id: fetchedUsers.result.users[0].id,
            firstName: fetchedUsers.result.users[0].firstName,
            lastName: fetchedUsers.result.users[0].lastName,
            organizationid: fetchedUsers.result.users[0].organization,
            email: fetchedUsers.result.users[0].mail,
            role: fetchedUsers.result.users[0].userRole,
            accepted: fetchedUsers.result.users[0].accepted,
            status: "online" // Add the missing status property
          };

        setUsers(userArray);
        
      });
    }
    setShowUsers(!showUsers);
  };

  useEffect(() => {
    if (auth?.accessToken) {
      getUserInfo(auth.accessToken).then(userInfo => setUser(userInfo));
    }
  }, []);

  return (
    <Drawer
      PaperProps={{
        sx: {
          backgroundColor: "#292929",
        },
      }}
      sx={{
        width: drawerWidth,
        position: "static",
        flexGrow: 1,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Divider />
      <Typography
        sx={{ width: "100%", textAlign: "center", marginTop: '20px' }}
        variant="h6"
        noWrap
        component="div"
      >
        Organisations
      </Typography>
      <Button
        onClick={handleShowUsers}
        variant="contained"
        color="primary"
        sx={{ margin: '10px' }}
      >
        {showUsers ? 'Hide Users' : 'Show All Users'}
      </Button>
      {showUsers && (
        <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#606060',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
        }}
      >
        <List>
          {users.map((rand_user) => (
            <ListItem key={rand_user.id} disablePadding>
                <ListItemText primary={`${rand_user.firstName} ${rand_user.lastName}`} secondary={`Role: ${rand_user.role}`} />
            </ListItem>
          ))}
        </List>
        </Box>
      )}
      <List>
        {organizations.map((organization) => (
          <>
            <ListItem
              sx={{ justifyContent: "center" }}
              key={organization.id}
              disablePadding
            >
              <p style={{ marginBlock: "0rem", fontSize: "25px" }}>
                {organization.name}
              </p>
            </ListItem>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingInline: "0.5rem",
              }}
            ></div>
            {repositories.map((repository) =>
              repository.organizationId === organization.id ? (
                <>
                  <ListItem key={repository.id} sx={{ paddingInline: "5px" }}>
                    <p
                      style={{
                        padding: "0",
                        fontSize: "25px",
                        marginBlock: "10px",
                      }}
                    >
                      {repository.name}
                    </p>
                  </ListItem>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      paddingInline: "0.5rem",
                    }}
                  >
                    <p style={{ fontSize: "0.9rem" }}>Resources</p>
                    <Box sx={{ marginLeft: "auto" }}>
                      <ResourceUploadButton
                        orgId={repository.organizationId}
                        repId={repository.id}
                      />
                    </Box>
                  </div>
                  {resources.map((resource) =>
                    resource.repositoryId === repository.id &&
                    resource.type !== "operator" ? (
                      <>
                        <ListItem key={resource.id} disablePadding>
                          <ListItemButton
                            sx={{ paddingBlock: 0 }}
                            onClick={(_) => handleDownload(resource)}
                          >
                            <ListItemText
                              secondary={resource.name}
                              secondaryTypographyProps={{ fontSize: "0.8rem" }}
                            />
                          </ListItemButton>
                        </ListItem>
                      </>
                    ) : (
                      ""
                    )
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      paddingInline: "0.5rem",
                    }}
                  >
                    <p style={{ fontSize: "0.9rem" }}>Operators</p>
                    <Box sx={{ marginLeft: "auto" }}>
                      <OperatorUploadButton
                        orgId={repository.organizationId}
                        repId={repository.id}
                      />
                    </Box>
                  </div>
                  {resources.map((resource) =>
                    resource.repositoryId === repository.id &&
                    resource.type === "operator" ? (
                      <>
                        <ListItem key={resource.id} disablePadding>
                          <ListItemButton sx={{ paddingBlock: 0 }}>
                            <ListItemText
                              secondary={resource.name}
                              secondaryTypographyProps={{ fontSize: "0.8rem" }}
                            />
                          </ListItemButton>
                        </ListItem>
                      </>
                    ) : (
                      ""
                    )
                  )}
                </>
              ) : (
                ""
              )
            )}
            <ListItem sx={{ justifyContent: "center" }}>
              <Box
                sx={{
                  width: "auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CreateRepositoryButton orgId={organization.id} />
              </Box>
            </ListItem>
          </>
        ))}
      </List>
      <Button
        onClick={logout}
        variant="contained"
        color="error"
        sx={{ position: "fixed", bottom: 0, left: 0 }}
      >
        Logout
      </Button>
      {user ? (
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '20px', position: "fixed", bottom: 0, left: 120 }}>
          <Button
            key={user?.id}
            variant="contained"
            color="info"
            sx={{ display: 'flex', alignItems: 'center', marginRight: '15px', cursor: 'pointer' }}
            onClick={() => user && setSelectedUser(user)}
          >
            <Box
              className="status-rectangle"
              sx={user ? {
                width: '87px',
                height: '33.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px'
              } : {}}
            >
              {user ? user.firstName + " " + user.lastName[0] : ''}
            </Box>
          </Button>
        </Box>
      ) : null}
      {selectedUser && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#606060',
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
          <Typography variant="body1"><strong>Role :</strong> {selectedUser.role}</Typography>
          <Button onClick={() => setSelectedUser(null)} sx={{ marginTop: '10px' }}>Close</Button>
        </Box>
      )}
    </Drawer>
  );
};
