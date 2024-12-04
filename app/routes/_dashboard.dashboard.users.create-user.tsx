import { LoaderFunction, redirect, ActionFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { getUser } from "~/utils/session.server";
// import { db } from "~/utils/db.server";
import { 
  register,
  validateUsername, 
  validatePassword, 
  comparePasswords 
} from "~/utils/session.server";



interface Error {
  username?: string[];
  password?: string[];
  role?: string;
  password2?: string;
}


export const loader: LoaderFunction = async ({request}) => {
  const user = await getUser(request);
  if (!user || user.role !== "admin") {
    return redirect("/login");
  }
  return null;
};




export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const password2 = formData.get("password2") as string;
  const role = formData.get("role") as string;

  let errors: Error = {};

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.success) {
    errors.username = usernameValidation.errors?.formErrors || [];
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.success) {
    errors.password = passwordValidation.errors?.formErrors || [];
  }

  // Compare passwords
  const passwordCompareResult = comparePasswords(password, password2);
  if (!passwordCompareResult.success) {
    errors.password2 = passwordCompareResult.errors;
  }

  // Validate role
  if (!["admin", "user"].includes(role)) {
    errors.role = "Invalid role selected";
  }

  // If errors exist, return them to the form
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Create user in the database

  try {
    await register({ username, password, role });
  } catch (error) {
    throw new Response("Failed to create user", { status: 500 });
  }
  return redirect("/dashboard/users");
};



export default function CreateUser() {
  const actionData = useActionData<typeof action>();


  return (
    <div className="mt-12 bg-slate-700 rounded shadow-lg p-8">
      <h2 className="text-lg lg:ml-8 font-semibold mb-8 text-white">Create New User</h2>

      <Form method="post" className=" mt-12 lg:ml-8">
        {/* Username */}
        <div>
          <label htmlFor="username" className="text-white block text-md font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter username"
            className="md:w-2/3 lg:w-1/3 p-2 border rounded bg-white"
          />
          {actionData?.errors?.username ? (
            actionData.errors.username.map((err: string, idx: number) => (
          <p key={idx} className="text-xs text-slate-200 my-2 ml-2">* {err}</p>
            ))
          ) : null}
        </div>

        {/* Password */}
        <div className="mt-12">
          <label htmlFor="password" className="text-white block text-md font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter password"
            className="md:w-2/3 lg:w-1/3 p-2 border rounded bg-white"
          />
          {actionData?.errors?.password ? (
            actionData.errors.password.map((err: string, idx: number) => (
          <p key={idx} className="text-xs text-slate-200 my-2 ml-2">* {err}</p>
            ))
          ) : null}
        </div>

        {/* Confirm Password */}
        <div className="mt-4">
          <label htmlFor="password2" className="text-white block text-md font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="password2"
            name="password2"
            placeholder="Confirm password"
            className="md:w-2/3 lg:w-1/3 p-2 border rounded bg-white"
          />
          {actionData?.errors?.password2 ? (
                <p  className="text-xs text-slate-200 my-2 ml-2">* {actionData.errors.password2}</p>
          ) : null}
        </div>

        {/* Role */}
        <div className="mt-8">
          <label htmlFor="role" className="text-white block text-sm font-medium mb-2">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="md:w-2/3 lg:w-1/3 p-2 border rounded bg-white"
            defaultValue="user"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {actionData?.role && <p className="text-red-500 mt-1">{actionData.role}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-500 text-white mt-8 px-4 py-2 rounded hover:bg-blue-600"
        >
          Create User
        </button>
      </Form>
    </div>
  );
}
