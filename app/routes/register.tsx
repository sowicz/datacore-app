import {Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node"; // or cloudflare/deno
import { redirect } from "@remix-run/node"; // or cloudflare/deno

import { 
  register,
  validateUsername, 
  validatePassword, 
  comparePasswords 
} from "~/utils/session.server";


interface Error {
  username?: string[];
  password?: string[];
  password2?: string;
}



export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const username  = String(formData.get("username"));
  const password = String(formData.get("password"));
  const password2 = String(formData.get("password2"));
  
  let errors: Error = {};

  
    // Validate username
  const usernameResult = validateUsername(username);
  if (!usernameResult.success) {
    errors.username = usernameResult.errors?.formErrors || [];
  }

  // Validate password
  const passwordResult = validatePassword(password);
  if (!passwordResult.success) {
    errors.password = passwordResult.errors?.formErrors || [];
  }

  // Compare passwords
  const passwordCompareResult = comparePasswords(password, password2);
  if (!passwordCompareResult.success) {
    errors.password2 = passwordCompareResult.errors;
  }

  // Return errors if validation fails
  if (Object.keys(errors).length > 0) {
    return { errors };
  }
  const role = "user"
  // Proceed with user registration
  await register({ username, password, role});

  return redirect("/");
};




export default function Register(){

  const actionData = useActionData<typeof action>();

  return (
    <div className='w-3/4 mx-auto'>

    <Form action="/register" method="post" className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create user</h2>

      <div className="mb-4 mt-8">
        <label htmlFor="login" className="block text-s font-medium text-gray-700">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your Username"
        />
        {actionData?.errors?.username ? (
          actionData.errors.username.map((err: string, idx: number) => (
            <p key={idx} className="text-xs text-slate-800 my-2 ml-2">* {err}</p>
          ))
        ) : null}
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-s font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          name="password" 
          required
          className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your password"
        />
        {actionData?.errors?.password ? (
          actionData.errors.password.map((err: string, idx: number) => (
            <p key={idx} className="text-xs text-slate-800 my-2 ml-2">* {err}</p>
          ))
        ) : null}
      </div>
      <div className="mb-6">
        <label htmlFor="password2" className="block text-s font-medium text-gray-700">Confirm Password</label>
        <input
          type="password"
          id="password2"
          name="password2"
          required
          className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Confirm your password"
        />
        {actionData?.errors?.password2 ? (
            <p  className="text-xs text-slate-800 my-2 ml-2">* {actionData.errors.password2}</p>
        ) : null}
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
      >
        Submit
      </button>
      <div className="text-slate-600 m-auto">
        <h4 className=" mt-8 text-s">Login requirements:</h4>
        <ul className="list-disc mt-1 text-xs flex flex-wrap w-full justify-between">
          <li className="ml-8 w-1/3">min 6 characters</li>
          <li className="ml-8 w-1/3">min 1 upper letter</li>
          <li className="ml-8 w-1/3"> min 1 symbol</li>
          <li className="ml-8 w-1/3">max 16 characters</li>
        </ul>
        <h4 className="mt-4 text-s">Password requirements:</h4>
        <ul className="list-disc text-xs flex flex-wrap w-full justify-between">
          <li className="ml-8 w-1/3">min 8 characters</li>
          <li className="ml-8 w-1/3">min 1 upper letter</li>
          <li className="ml-8 w-1/3">min 1 symbol</li>
          <li className="ml-8 w-1/3">max 32 characters</li>
        </ul>
      </div>
    </Form>
    </div>
  );
};

