import { LoaderFunction, redirect, ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { getUser } from "~/utils/session.server";
import { db } from "~/utils/db.server";


interface Error {
  linkError? : string;
  nameError? : string;
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
  const link = formData.get("link") as string;
  const nameLink = formData.get("nameLink") as string;


  let errors : Error = {}

  if (!link.includes(".")) {
    errors.linkError = "Not valid link to website"
  }

  if(nameLink.length > 24 || nameLink.length < 3) {
    errors.nameError = "Name length can be minimum 3 and maximum 24 characters"
  }
  
  // Return errors if validation fails
  if (Object.keys(errors).length > 0) {
    return { errors };
  } 

  // Save the data to the database
  try {
    await db.links.create({
      data: {
        link,
        name: nameLink,
      },
    });
    return redirect("/dashboard/links/list");
  } catch (error) {
    return {
      errors: {
        linkError: "An error occurred while saving the data.",
      },
    };
  }

};



export default function CreateUser() {
  const actionData = useActionData<typeof action>();


  return (
    <div className="mt-12 bg-slate-700 rounded shadow-lg p-8">
      <h2 className="text-lg lg:ml-8 font-semibold mb-4 text-white">Add new link</h2>

      <Form method="post" className="mt-12 h-fit lg:ml-8">
        {/* Link */}
        <div>
          <label htmlFor="link" className="text-white block text-md font-medium mb-2">
            Link to site
          </label>
          <input
            type="text"
            id="link"
            name="link"
            placeholder="Enter link"
            className="md:w-2/3 lg:w-1/3 p-2 border rounded bg-white"
          />
          {actionData?.errors.linkError && (
            <div className="mt-4 p-2 md:w-2/3 lg:w-1/3 text-xs bg-red-100 border border-red-300 text-red-800 rounded">
              {actionData.errors.linkError}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="mt-10">
          <label htmlFor="name" className="text-white block text-md font-medium mb-2">
            Name that will be visible
          </label>
          <input
            type="text"
            id="nameLink"
            name="nameLink"
            placeholder="Enter name"
            className="md:w-2/3 lg:w-1/3 p-2 border rounded bg-white"
          />
          {actionData?.errors.nameError && (
            <div className="mt-4 p-2 md:w-2/3 lg:w-1/3 mb-4 text-xs bg-red-100 border border-red-300 text-red-800 rounded">
              {actionData.errors.nameError}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-500 text-white mt-12 md:w-2/3 lg:w-1/3 px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </Form>
    </div>
  );
}
