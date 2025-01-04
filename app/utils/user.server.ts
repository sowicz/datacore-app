import bcrypt from "bcryptjs";
import { db } from "./db.server";


export interface ValidationResult<T> {
  success: boolean;
  errors?: T;
};
export type LoginForm = {
  username : string;
  password: string;
  role: string;
};
export type changePasswordForm = {
  id : string | undefined;
  password: string;
};
export type deleteUserForm = {
  id : string ;
  currentUserPassword: string;
  idToDel: string;
};




export async function register({ username , password, role }: LoginForm) {
  const salt = bcrypt.genSaltSync(12)
  const passwordHash = await bcrypt.hash(password, salt);
  
  try {
    const user = await db.user.create({ 
      data: {
        username: username,
        password: passwordHash,
        role: role
      },
    })
    return { success: true }; 
  } catch (error) {
    return { success: false, error: "Failed to register user" }; 
  }
}



export async function changePassword({ id , password }: changePasswordForm) {
  const salt = bcrypt.genSaltSync(12)
  const passwordHash = await bcrypt.hash(password, salt);
  
  try {
    const user = await db.user.update({
      where: { id },
      data: {
        password: passwordHash,
      },
    });
    return { success: true }; 
  } catch (error) {
    return { success: false, error: "Failed to change password" }; 
  }
}



export async function deleteUser({id, currentUserPassword, idToDel} : deleteUserForm ) {
  const actualUser = await db.user.findUnique({ where: { id } });

  // Validate the current user exists
  if (!actualUser) {
    return { success: false, error: "Wrong user, sorry" };
  }

  // Check if the provided password matches
  const isValid = await bcrypt.compare(currentUserPassword, actualUser.password);
  if (!isValid) {
    return { success: false, error: "Incorrect password." };
  }
  
  // Attempt to delete the target user
  try {
    await db.user.delete({
      where: { id: idToDel },
    });
    return { success: true }; // Deletion successful
  } catch (err) {
    return { success: false, error: "Failed to delete the user." }; // Deletion error
  }
}