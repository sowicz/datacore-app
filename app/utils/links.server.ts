import bcrypt from "bcryptjs";
import { db } from "./db.server";


export type deleteLinkForm = {
  id : string ;
  currentUserPassword: string;
  idToDel: string;
};
export type addLinkForm = {
  link: string;
  nameLink: string;
};
export type editLinkForm = {
  id: number;
  link: string;
  nameLink: string;
};


// --------------- Add link

export async function AddLink({link, nameLink} : addLinkForm ) {

  try {
    await db.links.create({
      data: {
        link,
        name: nameLink,
      },
    });
    return { success: true }; 
  } catch (err) {
    return { success: false, error: "Failed to add the link." };
  }
}



// ------------- DELETE LINK

export async function deleteLink({id, currentUserPassword, idToDel} : deleteLinkForm ) {
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
    await db.links.delete({
      where: { id: Number(idToDel) },
    });
    return { success: true }; // Deletion successful
  } catch (err) {
    return { success: false, error: "Failed to delete the link." }; // Deletion error
  }
}


// ------------- Edit LINK


export async function EditLink({id, link, nameLink} : editLinkForm ) {

  try {
    await db.links.update({
      where: { id },
      data: {
        link,
        name: nameLink,
      },
    });
    return { success: true }; 
  } catch (err) {
    return { success: false, error: "Failed to edit the link." };
  }
}

