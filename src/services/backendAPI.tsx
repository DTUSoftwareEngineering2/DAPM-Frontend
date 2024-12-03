import { log } from "console";
import { Stream } from "stream";
import { json } from "stream/consumers";
import axios from "axios";

const vmPath = "se2-c.compute.dtu.dk:5000";
const localPath = `localhost:5003`;

const path = localPath;
const BASE_URL = `http://` + path;

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
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
    const response = await fetch(`http://` + path + `/status/${ticket}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const jsonData = await response.json();
    //console.log(jsonData)
    return jsonData;
  } catch (error) {
    console.error("Error fetching status:", error);
    return error;
  }
}

export async function fetchFile(ticket: string) {
  try {
    const response = await fetch(`http://` + path + `/status/${ticket}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    //console.log(jsonData)
    return response;
  } catch (error) {
    console.error("Error fetching status:", error);
    return error;
  }
}

export async function fetchOrganisations() {
  try {
    const response = await fetch(`http://` + path + `/organizations`);
    if (!response.ok) {
      throw new Error("Fetching orgs, Network response was not ok");
    }
    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching orgs, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchOrganisation(orgId: string) {
  try {
    const response = await fetch(`http://` + path + `/Organizations/${orgId}`);
    if (!response.ok) {
      throw new Error("Fetching org, Network response was not ok");
    }
    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching org, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchOrganisationRepositories(orgId: string) {
  try {
    const response = await fetch(
      `http://` + path + `/Organizations/${orgId}/repositories`
    );
    if (!response.ok) {
      throw new Error("Fecthing reps, Network response was not ok");
    }
    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fecthing reps, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchRepository(orgId: string, repId: string) {
  try {
    const response = await fetch(
      `http://` + path + `/Organizations/${orgId}/repositories/${repId}`
    );
    if (!response.ok) {
      throw new Error("Fecthing rep, Network response was not ok");
    }
    const jsonData = await response.json();

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
    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fecthing rep, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchRepositoryResources(orgId: string, repId: string) {
  try {
    const response = await fetch(
      `http://` +
      path +
      `/Organizations/${orgId}/repositories/${repId}/resources`
    );
    if (!response.ok) {
      throw new Error("Fetching resources, Network response was not ok");
    }
    const jsonData = await response.json();

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
          //console.log(data)
          await delay(1000); // Wait for 1 second before retrying
        } catch (error) {
          if (retries === maxRetries - 1) {
            throw new Error("Max retries reached");
          }
        }
      }
      throw new Error("Failed to fetch data");
    };

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching resources, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchResource(
  orgId: string,
  repId: string,
  resId: string
) {
  try {
    const response = await fetch(
      `http://` +
      path +
      `/Organizations/${orgId}/repositories/${repId}/resources/${resId}`
    );
    if (!response.ok) {
      throw new Error("Fetching resource, Feching Network response was not ok");
    }
    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching resource, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchRepositoryPipelines(orgId: string, repId: string) {
  try {
    const response = await fetch(
      `http://` +
      path +
      `/Organizations/${orgId}/repositories/${repId}/pipelines`
    );
    if (!response.ok) {
      throw new Error("fetching pipelines, Network response was not ok");
    }
    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("fetching pipelines, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchPipeline(
  orgId: string,
  repId: string,
  pipId: string
) {
  try {
    const response = await fetch(
      `http://` +
      path +
      `/Organizations/${orgId}/repositories/${repId}/pipelines/${pipId}`
    );
    if (!response.ok) {
      throw new Error("fetching pipeline, Network response was not ok");
    }
    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("fetching pipeline, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function putRepository(orgId: string, repositoryName: string) {
  const headers = new Headers();
  headers.append("accept", "application/json");
  headers.append("Content-Type", "application/json");

  try {
    const response = await fetch(
      `http://` + path + `/Organizations/${orgId}/repositories`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ name: repositoryName }),
      }
    );

    if (!response.ok) {
      throw new Error("put rep, Network response was not ok");
    }

    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
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
    const response = await fetch(
      `http://` +
      path +
      `/Organizations/${orgId}/repositories/${repId}/resources`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("put res, Network response was not ok");
    }

    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
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
  console.log("put pipeline");
  console.log(orgId + " " + repId);
  console.log(pipelineData);
  try {
    const response = await fetch(
      `http://${path}/Organizations/${orgId}/repositories/${repId}/pipelines`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(pipelineData),
      }
    );

    if (!response.ok) {
      throw new Error("put pipeline, Network response was not ok");
    }

    const jsonData = await response.json();
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

    // Call getData function with the ticketId obtained from fetchOrganisations
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
    const response = await fetch(
      `http://${path}/Organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/executions`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("put execution, Network response was not ok");
    }

    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from putExecution
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
    const response = await fetch(
      `http://${path}/Organizations/${orgId}/repositories/${repId}/pipelines/${pipeId}/executions/${exeId}/commands/start`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("put command start, Network response was not ok");
    }

    const jsonData = await response.json();

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
      // throw new Error("Failed to command start");
    };

    // Call getData function with the ticketId obtained from putExecution
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("put command start, Error fetching data:", error);
    // throw error; // Propagate error to the caller
  }
}

export async function putOperator(
  orgId: string,
  repId: string,
  formData: FormData
) {
  try {
    const response = await fetch(
      `http://` +
      path +
      `/Organizations/${orgId}/repositories/${repId}/resources/operators`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("put res, Network response was not ok");
    }

    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("put res, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}


export async function PostNewPeer(domainName: string) {
  try {
    const formData = new FormData();
    formData.append("targetPeerDomain", domainName);

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const response = await fetch(
      `http://` + path + `/system/collab-handshake`,
      {
        method: "POST",
        body: JSON.stringify({ targetPeerDomain: domainName }),
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const jsonData = await response.json();

    // Fetch additional data recursively
    var retryNumber = 0;
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

    // Call getData function with the ticketId obtained from fetchOrganisations
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
    const response = await fetch(
      `http://` +
      path +
      `/organizations/${organizationId}/repositories/${repositoryId}/resources/${resourceId}/file`
    );
    if (!response.ok) {
      throw new Error("Fetching orgs, Network response was not ok");
    }
    const jsonData = await response.json();

    // Fetch additional data recursively
    const getData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const response = (await fetchFile(ticketId)) as any;
          if (response.ok) {
            await delay(1000);
            return response;
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

    // Call getData function with the ticketId obtained from fetchOrganisations
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching orgs, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export async function fetchUserInfo(accessToken: string) {
  try {
    const response = await fetch(`http://${path}/user/info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Fetching user info, Network response was not ok");
    }

    // Extract the ticketId from the initial response
    const jsonData = await response.json();
    const ticketId = jsonData.ticketId;

    // Define a function to fetch the status using the ticketId
    const getStatusData = async (ticketId: string): Promise<any> => {
      const maxRetries = 10;
      const delay = (ms: number) =>
        new Promise(resolve => setTimeout(resolve, ms));

      for (let retries = 0; retries < maxRetries; retries++) {
        try {
          const data = await fetchStatus(ticketId);
          // console.log("FETCH USER");
          // console.log(data);
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
    throw error;
  }
}

export async function fetchUsers(accessToken: string) {
  try {
    const response = await fetch(`http://${path}/users/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Fetching users, Network response was not ok");
    }
    const jsonData = await response.json();

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

    // Call getData function with the ticketId obtained from fetchUsers
    return await getData(jsonData.ticketId);
  } catch (error) {
    console.error("Fetching users, Error fetching data:", error);
    throw error; // Propagate error to the caller
  }
}

export const validateUser = async (
  accessToken: string,
  userId: string,
  accept: number
) => {
  try {
    const response = await fetch(`http://${path}/Users/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        accept,
      }),
    });

    if (!response.ok) {
      throw new Error("Validating user, Network response was not ok");
    }
  } catch (error) {
    console.error("Validating user, Error fetching data:", error);
    throw error;
  }
};

export const DeleteUser = async (accessToken: string, userId: string) => {
  try {
    const response = await fetch(`http://${path}/Users/delete/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Deleting user, Network response was not ok");
    }
  } catch (error) {
    console.error("Deleting user, Error fetching data:", error);
    throw error;
  }
};
