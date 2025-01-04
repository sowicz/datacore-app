import { LoaderFunction, redirect, ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData, } from "@remix-run/react";
import { useState } from "react"; 
import { getUser } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { EditLink } from "~/utils/links.server";



interface Error {
  linkError?: string;
  nameError?: string;
}



export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request); 
  if (!user || user.role !== "admin") {
    return redirect("/login");
  }

  const id = Number(params.id); // Convert `id` to a number
  if (isNaN(id)) {
    throw new Response("Invalid ID", { status: 400 });
  }

  const linktoEdit = await db.links.findUnique({
    where: { id },
  });
  if (!linktoEdit) {
    throw new Response("Link not found", { status: 404 });
  }
  return { user, linktoEdit };
};



export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const link = formData.get("link") as string;
  const nameLink = formData.get("nameLink") as string;

  const id = Number(params.id); // Convert `id` to a number
  if (isNaN(id)) {
    throw new Response("Invalid ID", { status: 400 });
  }
  let errors: Error = {};

  // Validation
  if (!link.includes(".")) {
    errors.linkError = "Please enter a valid URL.";
  }
  if (nameLink.length < 3 || nameLink.length > 24) {
    errors.nameError = "Name must be between 3 and 24 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }
  // Update the link in the database
  try {
    await EditLink({id, link, nameLink})
  } catch (error) {
    return {
      errors: {
        linkError: "An error occurred while updating the link.",
      },
    };
  }
  return redirect("/dashboard/links/list");
};


export default function LinkEdit() {
  const { linktoEdit } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <div className="mt-12 bg-slate-700 rounded-lg shadow-xl p-8">
      <h2 className="text-xl font-semibold mb-8 text-white">Edit Link</h2>

        {/* Link Info Table */}
        <div className="text-white flex justify-start">
          <table className="md:w-2/3 lg:w-1/3 max-w-md bg-gray-800 text-left border-collapse rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Link</th>
                <th className="px-6 py-3 text-sm font-semibold">Name</th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-gray-900 odd:bg-gray-800">
                <td className="px-6 py-4 text-slate-300">{linktoEdit.link}</td>
                <td className="px-6 py-4 font-semibold text-blue-400">{linktoEdit.name}</td>
              </tr>
            </tbody>
          </table>
        </div>

      <Form method="post" className="mt-12">
        {/* Link Field */}
        <div>
          <label htmlFor="link" className="block text-white text-sm font-medium mb-2">
            Link URL
          </label>
          <input
            type="text"
            id="link"
            name="link"
            defaultValue={linktoEdit.link}
            placeholder="Enter link URL"
            className="w-full md:w-2/3 lg:w-1/3 px-4 py-2 border rounded-lg bg-gray-100 text-gray-800"
          />
          {actionData?.errors?.linkError && (
            <p className="text-red-400 text-xs mt-1">{actionData.errors.linkError}</p>
          )}
        </div>

        {/* Name Field */}
        <div className="mt-6">
          <label htmlFor="nameLink" className="block text-white text-sm font-medium mb-2">
            Link Name
          </label>
          <input
            type="text"
            id="nameLink"
            name="nameLink"
            defaultValue={linktoEdit.name}
            placeholder="Enter link name"
            className="w-full md:w-2/3 lg:w-1/3 px-4 py-2 border rounded-lg bg-gray-100 text-gray-800"
          />
          {actionData?.errors?.nameError && (
            <p className="text-red-400 text-xs mt-1">{actionData.errors.nameError}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full md:w-2/3 lg:w-1/3 mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          Save Changes
        </button>
      </Form>
      <div className="mt-16 md:w-2/3 lg:w-1/3 w-full">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Delete link</h3>
        <p className="text-sm text-gray-300">
          Are you sure you want to delete this link? This action cannot be undone.
        </p>
        <button
          type="button"
          className="w-full mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
          onClick={openModal}
        >
          Delete Link
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
            <Form method="post" action="/dashboard/links/delete">
              <input type="hidden" name="linkid" value={linktoEdit.id} />
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
  );
}