import { auth } from "../auth";

export const getUserSession = async () => {
  return await auth();
};
