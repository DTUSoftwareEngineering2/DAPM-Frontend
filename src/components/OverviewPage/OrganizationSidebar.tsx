import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
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
import {
  DeleteUser,
  downloadResource,
  fetchUsers,
} from "../../services/backendAPI";
import CreateRepositoryButton from "./Buttons/CreateRepositoryButton";
import OperatorUploadButton from "./Buttons/OperatorUploadButton";
import AuthContext from "../../context/AuthProvider";
import { User, getUserInfo } from "../../redux/userStatus";
import { validateUser } from "../../services/backendAPI";

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

  /**
   * @author Thomas Corthay (s241749)
   * @date 2024-10-18
   */
  const [user, setUser] = useState<User | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);

  const fetchAndSetUsers = async () => {
    if (auth?.accessToken) {
      const fetchedUsers = await fetchUsers(auth.accessToken);
      const userArray = fetchedUsers.result.users.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationid: Number(user.organization),
        email: user.mail,
        role: user.userRole,
        accepted: user.accepted,
        status: "online",
      }));
      setUsers(userArray);
    }
  };

  useEffect(() => {
    if (auth?.accessToken) {
      getUserInfo(auth.accessToken).then(userInfo => setUser(userInfo));
    }
  }, []);
  // --------- end of Thomas' Corthay part-----------

  /**
   * @author Thomas Corthay (s241749) & Ma
   * @date 2024-10-18
   * @description Toggle display of users and fetch them if needed
   */
  const handleShowUsers = () => {
    if (!showUsers) {
      fetchAndSetUsers();
    }
    setShowUsers(!showUsers);
  };

  const handleAdminResponse = async (
    userId: string,
    accept: number,
    role: number
  ) => {
    if (auth.accessToken) {
      await validateUser(userId, accept, role);
      await fetchAndSetUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (auth.accessToken) {
      await DeleteUser(auth.accessToken, userId);
      await fetchAndSetUsers();
    }
  };

  return (
    <Drawer
      PaperProps={{
        sx: {
          backgroundColor: "#292929",
        },
      }}
      sx={{
        width: "240px",
        position: "static",
        flexGrow: 1,
        "& .MuiDrawer-paper": {
          width: "240px",
          boxSizing: "border-box",
        },
      }}
      variant="permanent"
      anchor="left">
      <Divider />
      <Typography
        sx={{ width: "100%", textAlign: "center", marginTop: "20px" }}
        variant="h6"
        noWrap
        component="div">
        Organisations
      </Typography>
      <List>
        {organizations.map(organization => (
          <>
            <ListItem
              sx={{ justifyContent: "center" }}
              key={organization.id}
              disablePadding>
              <p style={{ marginBlock: "0rem", fontSize: "25px" }}>
                {organization.name}
              </p>
            </ListItem>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingInline: "0.5rem",
              }}></div>
            {repositories.map(repository =>
              repository.organizationId === organization.id ? (
                <>
                  <ListItem key={repository.id} sx={{ paddingInline: "5px" }}>
                    <p
                      style={{
                        padding: "0",
                        fontSize: "25px",
                        marginBlock: "10px",
                      }}>
                      {repository.name}
                    </p>
                  </ListItem>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      paddingInline: "0.5rem",
                    }}>
                    <p style={{ fontSize: "0.9rem" }}>Resources</p>
                    <Box sx={{ marginLeft: "auto" }}>
                      <ResourceUploadButton
                        orgId={repository.organizationId}
                        repId={repository.id}
                      />
                    </Box>
                  </div>
                  {resources.map(resource =>
                    resource.repositoryId === repository.id &&
                    resource.type !== "operator" ? (
                      <>
                        <ListItem key={resource.id} disablePadding>
                          <ListItemButton
                            sx={{ paddingBlock: 0 }}
                            onClick={_ => handleDownload(resource)}>
                            <ListItemText
                              secondary={resource.name}
                              secondaryTypographyProps={{ fontSize: "0.8rem" }}
                            />
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => {}}>
                              <DeleteIcon />
                            </IconButton>
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
                    }}>
                    <p style={{ fontSize: "0.9rem" }}>Operators</p>
                    <Box sx={{ marginLeft: "auto" }}>
                      <OperatorUploadButton
                        orgId={repository.organizationId}
                        repId={repository.id}
                      />
                    </Box>
                  </div>
                  {resources.map(resource =>
                    resource.repositoryId === repository.id &&
                    resource.type === "operator" ? (
                      <>
                        <ListItem key={resource.id} disablePadding>
                          <ListItemButton sx={{ paddingBlock: 0 }}>
                            <ListItemText
                              secondary={resource.name}
                              secondaryTypographyProps={{ fontSize: "0.8rem" }}
                            />
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => {}}>
                              <DeleteIcon />
                            </IconButton>
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
                }}>
                <CreateRepositoryButton orgId={organization.id} />
              </Box>
            </ListItem>
          </>
        ))}
      </List>

      {/**
      * @author Thomas Corthay (s241749) & Màrk Gyöngyösi (s232976)
      * @date 2024-10-18
      * @description Renders a modal displaying a sortable, interactive list of users. 
      * Includes functionality for accepting/rejecting users, deleting users, and managing roles with responsive buttons. 
      */
      }
      {showUsers && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#606060",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
            width: "calc(100% - 240px)",
            height: "100%",
            marginLeft: "120px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#292929 #606060",
          }}>
          <Button
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "4px",
              color: "white",
              fontSize: "24px",
              backgroundColor: "red",
              "&:hover": {
                backgroundColor: "#ff3333",
                opacity: 0.8,
              },
            }}
            onClick={() => setShowUsers(false)}>
            X
          </Button>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>
            Users List
          </Typography>
          <List
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginX: "20px",
              padding: "0",
              gap: "8px",
            }}>
            {users
              .sort((a, b) =>
                a.accepted === b.accepted ? 0 : a.accepted ? 1 : -1
              )
              .map(rand_user => (
                <ListItem
                  key={rand_user.id}
                  disablePadding
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: "#4A4A4A",
                    borderRadius: "5px",
                  }}>
                  <ListItemText
                    primary={`${rand_user.firstName} ${rand_user.lastName}`}
                    secondary={`Id: ${rand_user.id}`}
                    sx={{
                      flex: 1,
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginLeft: "10px",
                    }}>
                    {rand_user.accepted === 1 ? (
                      <>
                        <Button
                          variant="contained"
                          style={{ width: "138px" }}
                          color="error"
                          onClick={() =>
                            handleDeleteUser(rand_user.id.toString())
                          }>
                          Delete
                        </Button>
                        {rand_user.role === 2 &&
                        (auth.role === 1 ||
                          localStorage.getItem("role") === "1") ? (
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ marginLeft: "10px" }}
                            onClick={() =>
                              handleAdminResponse(rand_user.id.toString(), 1, 3)
                            }>
                            Remove Manager
                          </Button>
                        ) : (
                          ""
                        )}

                        {(rand_user.role === 0 || rand_user.role === 3) &&
                        (auth.role === 1 ||
                          localStorage.getItem("role") === "1") ? (
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ marginLeft: "10px" }}
                            onClick={() =>
                              handleAdminResponse(rand_user.id.toString(), 1, 2)
                            }>
                            Add Manager
                          </Button>
                        ) : (
                          ""
                        )}
                      </>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          sx={{ marginRight: "10px" }}
                          onClick={() =>
                            handleAdminResponse(rand_user.id.toString(), 1, 3)
                          }>
                          ✓
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => {
                            handleAdminResponse(rand_user.id.toString(), 0, 3);
                            handleDeleteUser(rand_user.id.toString());
                          }}>
                          ✕
                        </Button>
                      </>
                    )}
                  </Box>
                </ListItem>
              ))}
          </List>
        </Box>
      )}


    {/**
    * @author Thomas Corthay (s241749) & Màrk Gyöngyösi (s232976)
    * @date 2024-10-18
    * @description Renders a button to toggle the visibility of the user list, displayed conditionally based on the user's role.
    * The button text dynamically updates to reflect the current state (show or hide users). 
    */
    }
      {(auth.role === 1 ||
        localStorage.getItem("role") === "1" ||
        auth.role === 2 ||
        localStorage.getItem("role") === "2") && (
        <Button
          onClick={handleShowUsers}
          variant="contained"
          color="primary"
          sx={{
            position: "fixed",
            bottom: 48,
            width: "240px",
            height: "40px",
          }}>
          {showUsers ? "Hide Users" : "Show All Users"}
        </Button>
      )}


      <Button
        onClick={logout}
        variant="contained"
        color="error"
        sx={{ position: "fixed", bottom: 0, left: 0 }}>
        Logout
      </Button>


      {/**
      * @author Thomas Corthay (s241749)
      * @date 2024-10-18
      */
      }
      {user ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginRight: "20px",
            position: "fixed",
            bottom: 0,
            left: 120,
          }}>
          <Button
            key={user?.id}
            variant="contained"
            color="info"
            sx={{
              display: "flex",
              alignItems: "center",
              marginRight: "15px",
              cursor: "pointer",
            }}
            onClick={() => user && setSelectedUser(user)}>
            <Box
              className="status-rectangle"
              sx={
                user
                  ? {
                      width: "87px",
                      height: "34px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }
                  : {}
              }>
              {user ? user.firstName + " " + user.lastName[0] : ""}
            </Box>
          </Button>
        </Box>
      ) : null}

      {/**
      * @author Thomas Corthay (s241749)
      * @date 2024-10-18
      */
      }
      {selectedUser && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#606060",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
          }}>
          <Typography variant="h6" sx={{ marginBottom: "10px" }}>
            {" "}
            {selectedUser.firstName + " " + selectedUser.lastName}
          </Typography>
          <Typography variant="body1">
            <strong>ID :</strong> {selectedUser.id}
          </Typography>
          <Typography variant="body1">
            <strong>Status :</strong>{" "}
            {selectedUser.status.charAt(0).toUpperCase() +
              selectedUser.status.slice(1)}
          </Typography>
          <Typography variant="body1">
            <strong>Organization :</strong> {selectedUser.organizationid}
          </Typography>
          <Typography variant="body1">
            <strong>Email :</strong> {selectedUser.email}
          </Typography>
          <Typography variant="body1">
            <strong>Role :</strong> {selectedUser.role}
          </Typography>
          <Button
            onClick={() => setSelectedUser(null)}
            sx={{ marginTop: "10px" }}>
            Close
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
