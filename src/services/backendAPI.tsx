import { log } from "console";
import { Stream } from "stream";
import { json } from "stream/consumers";
import axios from "axios";

const vmPath = "se2-c.compute.dtu.dk:5000";
const localPath = `localhost:5000`;

const path = localPath;
const BASE_URL = `http://` + path;

export const axiosPrivateNoJson = axios.create({
  baseURL: BASE_URL,
});

axiosPrivateNoJson.interceptors.request.use(
  config => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosPrivate.interceptors.request.use(
  config => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

function getAccessToken() {
  console.log(localStorage.getItem("accessToken"));
  return localStorage.getItem("accessToken");
}

export default axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export async function fetchPipelineStatus(
  orgId: string,
  repoId: string,
  pipId: string,
  execId: string
) {
  try {
    const newpipId = pipId.slice(9)
    const url = `http://` + path + `/Organizations/${orgId}/repositories/${repoId}/pipelines/${newpipId}/executions/${execId}/status`;
    console.log("I AM HEEEEEEERE")

    const response = await fetch(url);
    //console.log(response)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const statusTicket = await response.text(); // Since 'accept: text/plain', we use response.text()
    const parsedData = JSON.parse(statusTicket);
    const ticket = parsedData.ticketId;
    const getData = async (ticketId: string): Promise<any> => {
      console.log("I got inside")
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        console.log("im here for the " + retries + "th time")
        try {
          const statusResponse = await fetchStatus(ticketId);
          //console.log("NUMBER " + statusResponse.status)
          if (statusResponse.status > 0) {
            // const status = await statusResponse.text();
            // console.log("good status :)" + status)
            return statusResponse
          }
          //console.log(statusResponse)

          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch pipeline status");
    };

    const status = await getData(ticket);
    //console.log("END RESULT " + status.result.status.state)
    return status.result.status.state
  } catch (error) {
    console.error('Error fetching pipeline status', error);
    throw error;
  }
}

export async function fetchStatus(ticket: string) {
  try {
    const response = await axiosPrivate.get(`http://${path}/status/${ticket}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching status:", error);
    throw error;
  }
}

export async function fetchFile(ticket: string) {
  try {
    const response = await axiosPrivate.get(`http://${path}/status/${ticket}`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error fetching status:", error);
    throw error;
  }
}

export async function fetchOrganisations() {
  try {
    const response = await axios.get(`http://${path}/organizations`);
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));
      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000);
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching orgs, Error fetching data:", error);
    throw error;
  }
}

export async function fetchOrganisation(orgId: string) {
  try {
    const response = await axiosPrivate.get(
      `http://${path}/Organizations/${orgId}`
    );
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));
      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000);
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching org, Error fetching data:", error);
    throw error;
  }
}

export async function fetchOrganisationRepositories(orgId: string) {
  try {
    const response = await axiosPrivate.get(
      `http://${path}/Organizations/${orgId}/repositories`
    );
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000);
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fecthing reps, Error fetching data:", error);
    throw error;
  }
}

export async function fetchRepository(orgId: string, repId: string) {
  try {
    const response = await axiosPrivate.get(
      `http://${path}/Organizations/${orgId}/repositories/${repId}`
    );
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000);
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fecthing rep, Error fetching data:", error);
    throw error;
  }
}

export async function fetchRepositoryResources(orgId: string, repId: string) {
  try {
    const response = await axiosPrivate.get(
      `http://${path}/Organizations/${orgId}/repositories/${repId}/resources`
    );
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000);
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching resources, Error fetching data:", error);
    throw error;
  }
}

export async function fetchResource(
  orgId: string,
  repId: string,
  resId: string
) {
  try {
    const response = await axiosPrivate.get(
      `http://${path}/Organizations/${orgId}/repositories/${repId}/resources/${resId}`
    );
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000);
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching resource, Error fetching data:", error);
    throw error;
  }
}

export async function fetchRepositoryPipelines(orgId: string, repId: string) {
  try {
    const response = await axiosPrivate.get(
      `http://${path}/Organizations/${orgId}/repositories/${repId}/pipelines`
    );
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000);
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching pipelines, Error fetching data:", error);
    throw error;
  }
}

export async function fetchPipeline(
  orgId: string,
  repId: string,
  pipId: string
) {
  try {
    const response = await axiosPrivate.get(
      `/Organizations/${orgId}/repositories/${repId}/pipelines/${pipId}`
    );
    if (response.status !== 200) {
      throw new Error("fetching pipeline, Network response was not ok");
    }
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("fetching pipeline, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function putRepository(orgId: string, repositoryName: string) {
  try {
    const response = await axiosPrivate.post(
      `/Organizations/${orgId}/repositories`,
      { name: repositoryName },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status !== 200) {
      throw new Error("put rep, Network response was not ok");
    }
    const jsonData = response.data;

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("put rep, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function putResource(
  orgId: string,
  repId: string,
  formData: FormData
) {
  try {
    const response = await axiosPrivateNoJson.post(
      `/Organizations/${orgId}/repositories/${repId}/resources`,
      formData // Sending the form data directly
    );

    if (response.status !== 200) {
      throw new Error("put res, Network response was not ok");
    }

    const jsonData = response.data;

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    // Call getData function with the ticketId obtained from the response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("put res, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function putPipeline(
  orgId: string,
  repId: string,
  pipelineData: any
) {
  try {
    const response = await axiosPrivate.post(
      `/Organizations/${orgId}/repositories/${repId}/pipelines`,
      pipelineData
    );

    if (response.status !== 200) {
      throw new Error("put pipeline, Network response was not ok");
    }

    const jsonData = response.data;

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data.result.itemIds.pipelineId as string;
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    // Call getData function with the ticketId obtained from the response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("put pipeline, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function putExecution(
  orgId: string,
  repId: string,
  pipeId: string
) {
  try {
    const response = await axiosPrivate.post(
      `/Organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/executions`
    );

    if (response.status !== 200) {
      throw new Error("put execution, Network response was not ok");
    }

    const jsonData = response.data;

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data.result.itemIds.executionId as string;
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to post execution");
    };

    // Call getData function with the ticketId obtained from the response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("put execution, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function putCommandStart(
  orgId: string,
  repId: string,
  pipeId: string,
  exeId: string
) {
  try {
    const response = await axiosPrivate.post(
      `/Organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/executions/${exeId}/commands/start`
    );

    if (response.status !== 200) {
      throw new Error("put command start, Network response was not ok");
    }
    const jsonData = response.data;
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch command start data");
    };

    // Call getData function with the ticketId obtained from the response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("put command start, Error fetching data:", error);
    // throw error; // Uncomment to propagate error to the caller if needed
  }
}

export async function putOperator(
  orgId: string,
  repId: string,
  formData: FormData
) {
  try {
    const response = await axiosPrivateNoJson.post(
      `/Organizations/${orgId}/repositories/${repId}/resources/operators`,
      formData
    );

    if (response.status !== 200) {
      throw new Error("put operator, Network response was not ok");
    }

    const jsonData = response.data;

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch operator data");
    };

    // Call getData function with the ticketId obtained from the response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("put operator, Error fetching data:", error);
    // throw error; // Uncomment to propagate error to the caller if needed
  }
}

export async function PostNewPeer(domainName: string) {
  try {
    const formData = new FormData();
    formData.append("targetPeerDomain", domainName);
    const response = await axiosPrivate.post(`/system/collab-handshake`, {
      targetPeerDomain: domainName,
    });

    if (response.status !== 200) {
      throw new Error("Network response was not ok");
    }

    const jsonData = response.data;

    // Fetch additional data recursively
    let retryNumber = 0;
    const getData = async (ticketId: string): Promise<any> => {
      try {
        const data = await fetchStatus(ticketId);
        if (!data.status && retryNumber < 10) {
          retryNumber++;
          return await getData(ticketId); // Recursive call
        } else {
          return data; // Return data once condition is met
        }
      } catch (error) {
        throw error; // Propagate error to the outer catch block
      }
    };

    // Call getData function with the ticketId obtained from the response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function downloadResource(
  organizationId: string,
  repositoryId: string,
  resourceId: string
) {
  try {
    const response = await axiosPrivate.get(
      `/organizations/${organizationId}/repositories/${repositoryId}/resources/${resourceId}/file`
    );

    if (response.status !== 200) {
      throw new Error("Fetching resource, Network response was not ok");
    }

    const jsonData = response.data;

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const fileResponse = await fetchFile(ticketId);

          // Check for successful response based on status code
          if (fileResponse.status === 200) {
            await delay(1000); // Wait for 1 second before retrying
            return fileResponse;
          }

          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch file");
    };

    // Call getData function with the ticketId obtained from the response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Error fetching resource:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchUserInfo(accessToken: string) {
  try {
    const response = await axiosPrivate.get("/user/info", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error("Fetching user info, Network response was not ok");
    }

    // Extract the ticketId from the initial response
    const jsonData = response.data;
    const ticketId = jsonData.ticketId;

    // Define a function to fetch the status using the ticketId
    const getStatusData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status === 1) {
            // Check if status is completed
            return data.result.user; // Return the user data
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch user data");
    };

    // Call the getStatusData function and return the user information
    const userInfo = await getStatusData(ticketId);
    return {
      userId: userInfo.id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      organizationId: userInfo.organization,
      email: userInfo.mail,
      role: userInfo.userRole,
      accepted: userInfo.accepted,
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchUsers(accessToken: string) {
  try {
    const response = await axiosPrivate.get("/users/all", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error("Fetching users, Network response was not ok");
    }

    const jsonData = response.data;

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data;
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    // Call getData function with the ticketId obtained from the response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching users, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export const validateUser = async (
  userId: string,
  accept: number,
  role: number
) => {
  try {
    const response = await axiosPrivate.post("/Users/validate", {
      userId,
      accept,
      role,
    });

    return response.data;
  } catch (error) {
    console.error("Validating user, Error fetching data:", error);
    throw error;
  }
};

export const DeleteUser = async (accessToken: string, userId: string) => {
  try {
    const response = await axiosPrivate.delete(`/Users/delete/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error("Deleting user, Network response was not ok");
    }
  } catch (error) {
    console.error("Deleting user, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
};

export async function getExecutionDate(
  orgId: string,
  repId: string,
  pipeId: string
) {
  try {
    const response = await fetch(
      `http://${path}/organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/execution-date`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("get execution date, Network response was not ok");
    }

    const jsonData = await response.json();

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);

          if (data.status) {
            return data.result.executionDate; // Assuming this is where the dates are
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch execution dates");
    };

    // Call getData function with the ticketId obtained from the initial response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("get execution date, Error fetching data:", error);
    throw error;
  }
}

export async function setExecutionDate(
  orgId: string,
  repId: string,
  pipeId: string,
  executionDate: string
) {
  try {

    const date = new Date(executionDate);

    // Extract year, month, day, hour, minute, and second
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Format the output
    const formattedDate = `${year}-${month}-${day}%20${hours}%3A${minutes}%3A${seconds}`;

    const response = await fetch(
      `http://${path}/organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/set-execution-date?executionDate=${formattedDate}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("set execution date, Network response was not ok");
    }

    const jsonData = await response.json();

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          if (data.status) {
            return data.result; // Assuming this is where the updated information is
          }
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to set execution date");
    };

    // Call getData function with the ticketId obtained from the initial response
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("set execution date, Error setting data:", error);
    throw error;
  }
}
