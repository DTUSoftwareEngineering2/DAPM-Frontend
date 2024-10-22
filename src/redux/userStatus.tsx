import { fetchUserInfo } from "../services/backendAPI";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    status: string;
    organizationid: number;
    email: string;
  }

export const getUserInfo = async (accessToken: string): Promise<User | null> => {
  try {
    var defaultAccessToken = "";
    if (accessToken !== null) {
      defaultAccessToken = accessToken;
    }
    console.log("USER TOKEN");
    console.log(accessToken);

    const data = await fetchUserInfo(defaultAccessToken);
    const updatedUser: User = {
      id: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      status: "online",
      organizationid: data.organizationId,
      email: data.email,
    };
    console.log(data);
    return updatedUser;
  } catch (error) {
    console.error('Error getting user information:', error);
    return null;
  }
};