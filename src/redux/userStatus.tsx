/**
 * @file
 * @author Thomas Corthay
 * @date 2024-11-10
 * @description Contains the `User` interface definition and the `getUserInfo` function to fetch 
 * and format user information from the backend using an access token.
 */

import { fetchUserInfo } from "../services/backendAPI";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  status: string;
  organizationid: number;
  email: string;
  role: number;
  accepted: number;
}

export const getUserInfo = async (
  accessToken: string
): Promise<User | null> => {
  try {
    var defaultAccessToken = "";
    if (accessToken !== null) {
      defaultAccessToken = accessToken;
    }
    // console.log("USER TOKEN");
    // console.log(accessToken);

    const data = await fetchUserInfo(defaultAccessToken);
    const updatedUser: User = {
      id: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      status: "online",
      organizationid: data.organizationId,
      email: data.email,
      role: data.role,
      accepted: data.accepted,
    };
    return updatedUser;
  } catch (error) {
    console.error("Error getting user information:", error);
    return null;
  }
};
