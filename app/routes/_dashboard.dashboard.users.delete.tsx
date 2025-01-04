import { redirect, ActionFunction, LoaderFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { getUser } from "~/utils/session.server";
import { deleteUser } from "~/utils/user.server";



export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const idToDel = formData.get("userId") as string;
  const currentUserPassword = formData.get("password") as string;
  
  const user = await getUser(request);
  const id = user?.id || ""; 

  const result = await deleteUser({ id, currentUserPassword, idToDel });

  // Return errors or success messages to the frontend
  if (!result.success) {
    return { error: result.error };
  }

  return { message: "Successfully deleted the user." };
  
};




export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user || user.role !== "admin") {
    return redirect("/login");
  } else {
    return null
  }
}





export default function DeleteUser() {
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="p-6 max-w-lg mx-auto mt-12">
      {/* Conditional UI Message */}
      {actionData?.message && (
        <div className="mb-6 p-4 rounded bg-green-100 border border-green-300 text-green-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2l4-4M7 12a5 5 0 105 5a5 5 0 00-5-5z"
            />
          </svg>
          {actionData.message}
        </div>
      )}

      {actionData?.error && (
        <div className="mb-6 p-4 rounded bg-red-100 border border-red-300 text-red-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 10a6 6 0 01-6 6m0 0a6 6 0 01-6-6m6 6v4m0-20v4"
            />
          </svg>
          {actionData.error}
        </div>
      )}

      {/* Content */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Delete User
      </h2>
      <p className="text-gray-600">
        If you confirm the deletion, the user will be removed permanently.
      </p>

      {/* Add your form or additional actions */}
    </div>
  );
}