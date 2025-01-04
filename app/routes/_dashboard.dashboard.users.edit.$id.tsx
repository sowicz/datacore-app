import { LoaderFunction, redirect, ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, } from "@remix-run/react";
import { useState } from "react"; 
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import { changePassword } from "~/utils/user.server";
import { validatePassword, comparePasswords} from "~/utils/auth.server";



export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request); 
  if (!user || user.role !== "admin") {
    return redirect("/login");
  }

  const { id } = params;
  const userToEdit = await db.user.findUnique({
    where: { id },
  });

  if (!userToEdit) {
    throw new Response("User not found", { status: 404 });
  }
  if (userToEdit.role === "admin") {
    throw new Response("User not found", { status: 404 });
  }

  return { user, userToEdit }; // Pass logged-in user and target user
};



interface Error {
  password?: String[],
  password2?: String
}



export const action: ActionFunction = async ({ request, params }) => {
  const user = await getUser(request); 
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const password = formData.get("password") as string;
  const password2 = formData.get("password2") as string;
  // const role = formData.get("role") as string;


  const { id } = params;
  let errors: Error = {};


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



export default function EditUser() {
  const { userToEdit } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <div className="mt-12 bg-slate-700 rounded-lg shadow-xl">
      <div className="p-8">
        {/* User Info Table */}
        <div className="text-white flex justify-start">
          <table className="md:w-2/3 lg:w-1/3 max-w-md bg-gray-800 text-left border-collapse rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Username</th>
                <th className="px-6 py-3 text-sm font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-gray-900 odd:bg-gray-800">
                <td className="px-6 py-4 text-slate-300">{userToEdit.username}</td>
                <td className="px-6 py-4 font-semibold text-blue-400">{userToEdit.role}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Change Password Form */}
        <Form method="post" className="space-y-6 mt-10">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter a new password"
              className="md:w-2/3 lg:w-1/3 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {actionData?.errors?.password?.map((err: string, idx: number) => (
              <p key={idx} className="text-xs text-red-400 mt-1 ml-1">
                * {err}
              </p>
            ))}
          </div>

          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-gray-200 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="password2"
              name="password2"
              placeholder="Confirm password"
              className="md:w-2/3 lg:w-1/3 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {actionData?.errors?.password2 && (
              <p className="text-xs text-red-400 mt-1 ml-1">
                * {actionData.errors.password2}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full md:w-2/3 lg:w-1/3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            Save Changes
          </button>
        </Form>

        {/* Delete User Form */}
        <div className="mt-16 md:w-2/3 lg:w-1/3 w-full">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Delete User</h3>
          <p className="text-sm text-gray-300">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <button
            type="button"
            className="w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
            onClick={openModal}
          >
            Delete User
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
              <p className="text-sm text-gray-600 mb-6">
                Please enter your password to confirm the deletion of this user.
              </p>
              <Form method="post" action="/dashboard/users/delete">
                <input type="hidden" name="userId" value={userToEdit.id} />
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    Confirm Delete
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}