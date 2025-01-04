import { LoaderFunction, redirect, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { getUser  } from "~/utils/session.server";
import { changePassword } from "~/utils/user.server";
import { db } from "~/utils/db.server";
import { 
  validatePassword, 
  comparePasswords,
  validateActualPassword
} from "~/utils/auth.server";



export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request); 
  if (!user) {
    return redirect("/login");
  }

  const { id } = params;
  const userToEdit = await db.user.findUnique({
    where: { id },
  });

  if (!userToEdit) {
    throw new Response("User not found", { status: 404 });
  }

  return { user, userToEdit }; // Pass logged-in user and target user
};



interface Error {
  oldPassword?: String[],
  password?: String[],
  password2?: String
}



export const action: ActionFunction = async ({ request, params }) => {
  const user = await getUser(request); 
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const oldPassword = formData.get("oldPassword") as string;
  const password = formData.get("password") as string;
  const password2 = formData.get("password2") as string;
  // const role = formData.get("role") as string;


  const { id } = params;
  let errors: Error = {};

  // Validate actual Password
  const actualPassword = await validateActualPassword(user.id, oldPassword);
  if (!actualPassword.success) {
    errors.oldPassword = actualPassword.errors?.formErrors || [];
  }

  // Validate inputs
  const passwordResult = validatePassword(password);
  if (!passwordResult.success) {
    errors.password = passwordResult.errors?.formErrors || [];
  }

  // Compare passwords
  const passwordCompareResult = comparePasswords(password, password2);
  if (!passwordCompareResult.success) {
    errors.password2 = passwordCompareResult.errors;
  }

  // If validation fails, return errors
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // If validation succeeds, update the password
  try {
    await changePassword({ id: id as string, password });
    return redirect("/dashboard/users");
  } catch (error) {
    throw new Response("Failed to update password", { status: 500 });
  }
};



export default function UserSettings() {
  const { userToEdit } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="mt-12 bg-slate-600 rounded shadow-lg">
      <div className="p-8">
        
        <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
        {/* User Info */}
        <div className="mt-2 text-white">
          <p>Username: <span className="font-semibold">{userToEdit.username}</span></p>
        </div>
        <Form method="post" className="space-y-6 mt-8">
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-md font-medium text-white mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              placeholder="Enter your current password"
              className="md:w-2/3 lg:w-1/3  w-full p-2 border rounded bg-gray-100 text-gray-800"
            />
            {/* Optional password validation errors */}
            {actionData?.errors?.oldPassword ? (
              actionData.errors.oldPassword.map((err: string, idx: number) => (
            <p key={idx} className="text-xs text-slate-200 my-2 ml-2">* {err}</p>
              ))
            ) : null}
          </div>
          <div>
            <label htmlFor="password" className="mt-16 block text-md font-medium text-white mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter a new password"
              className="md:w-2/3 lg:w-1/3  w-full p-2 border rounded bg-gray-100 text-gray-800"
            />
            {/* Optional password validation errors */}
            {actionData?.errors?.password ? (
              actionData.errors.password.map((err: string, idx: number) => (
            <p key={idx} className="text-xs text-slate-200 my-2 ml-2">* {err}</p>
              ))
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="block text-md font-medium text-white mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="password2"
              name="password2"
              placeholder="Confirm password"
              className="md:w-2/3 lg:w-1/3  w-full p-2 border rounded bg-gray-100 text-gray-800"
            />
            {actionData?.errors?.password2 ? (
                  <p  className="text-xs text-slate-200 my-2 ml-2">* {actionData.errors.password2}</p>
            ) : null}
          </div>

          {/* Role Dropdown */}
          
          {/* <div>
            <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
              User Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue={userToEdit.role}
              className="md:w-2/3 lg:w-1/3 p-2 border rounded bg-gray-100 text-gray-800"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            {actionData?.errors?.role && (
              <p className="text-red-500">{actionData.errors.role}</p>
            )}
            
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </Form>


      </div>
    </div>
  )
}