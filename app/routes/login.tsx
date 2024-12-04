import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { login, createUserSession, getUser } from "~/utils/session.server";




type ActionData = {
  error?: string;
};



export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (user) return redirect("/dashboard/");
  return null;
};



export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return { error: "Invalid form submission" };
  }

  const user = await login({ username, password });
  if (!user) {
    return { error: "Invalid credentials" };
  }

  return createUserSession(user.id, "/dashboard");
};




export default function Login() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900">
      <div className="bg-slate-700 p-6 rounded shadow-lg w-full max-w-sm ">
        <div className="flex w-full space-x-4 justify-center">
          <h1 className="text-2xl text-white font-bold mb-8">Login</h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" className="animate-moveSkew bi bi-key" viewBox="0 0 16 16">
            <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"/>
            <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
          </svg>

        </div>
        <Form method="post">
          <div className="mb-4">
            <label className="block text-slate-200">Username</label>
            <input
              type="text"
              name="username"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-slate-200">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-400 text-white py-2 rounded">
            Login
          </button>
        </Form>
      </div>
    </div>
  );
}