import { redirect } from "@remix-run/node";
import { useLoaderData, Form, Outlet, Link, useLocation, NavLink } from "@remix-run/react";
import { getUser, destroyUserSession } from "~/utils/session.server";

export const loader = async ({ request }: { request: Request }) => {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  return { user };
};

export const action = async ({ request }: { request: Request }) => {
  return destroyUserSession(request);
};

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen h-fit flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">DataCore</h1>
        </div>
        <nav className="flex-1 px-4 mt-8 space-y-2">
          <label className="text-sm text-slate-600">General</label>
          <div className="w-full border-b-2 border-slate-800 rounded-md"></div>
          <NavLink to={`/dashboard/`} end
            className={({ isActive }) => `flex px-4 py-2 rounded 
            ${isActive ? "bg-gradient-to-r from-pink-500  to-orange-500" : "hover:bg-gray-700"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" y="10" fill="currentColor" className="bi bi-house-fill mr-3" viewBox="0 0 16 16">
              <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/>
              <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/>
            </svg>
            Dashboard
          </NavLink>
          <NavLink to={`/dashboard/docker`} 
            className={({ isActive }) => `flex px-4 py-2 rounded 
              ${isActive ? "bg-gradient-to-r from-pink-500  to-orange-500" : "hover:bg-gray-700"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-postage-fill mr-3" viewBox="0 0 16 16">
              <path d="M4.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/>
              <path d="M3.5 1a1 1 0 0 0 1-1h1a1 1 0 0 0 2 0h1a1 1 0 0 0 2 0h1a1 1 0 1 0 2 0H15v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1h-1.5a1 1 0 1 0-2 0h-1a1 1 0 1 0-2 0h-1a1 1 0 1 0-2 0h-1a1 1 0 1 0-2 0H1v-1a1 1 0 1 0 0-2v-1a1 1 0 1 0 0-2V9a1 1 0 1 0 0-2V6a1 1 0 0 0 0-2V3a1 1 0 0 0 0-2V0h1.5a1 1 0 0 0 1 1M3 3v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1"/>
            </svg>
            Docker
          </NavLink>
          {/* Conditional show users */}
          {user.role !== "admin" ? null :  
            <NavLink to={`/dashboard/users`} 
              className={({ isActive }) => `flex px-4 py-2 rounded 
              ${isActive ? "bg-gradient-to-r from-pink-500  to-orange-500" : "hover:bg-gray-700"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-people-fill mr-3" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
              </svg>
              Users
            </NavLink>
          }
          {user.role !== "admin" ? null :  
            <NavLink to={`/dashboard/links`} 
              className={({ isActive }) => `flex px-4 py-2 rounded 
              ${isActive ? "bg-gradient-to-r from-pink-500  to-orange-500" : "hover:bg-gray-700"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-globe2 mr-3" viewBox="0 0 16 16">
                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855q-.215.403-.395.872c.705.157 1.472.257 2.282.287zM4.249 3.539q.214-.577.481-1.078a7 7 0 0 1 .597-.933A7 7 0 0 0 3.051 3.05q.544.277 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9 9 0 0 1-1.565-.667A6.96 6.96 0 0 0 1.018 7.5zm1.4-2.741a12.3 12.3 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332M8.5 5.09V7.5h2.99a12.3 12.3 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.6 13.6 0 0 1 7.5 10.91V8.5zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741zm-3.282 3.696q.18.469.395.872c.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a7 7 0 0 1-.598-.933 9 9 0 0 1-.481-1.079 8.4 8.4 0 0 0-1.198.49 7 7 0 0 0 2.276 1.522zm-1.383-2.964A13.4 13.4 0 0 1 3.508 8.5h-2.49a6.96 6.96 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667m6.728 2.964a7 7 0 0 0 2.275-1.521 8.4 8.4 0 0 0-1.197-.49 9 9 0 0 1-.481 1.078 7 7 0 0 1-.597.933M8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855q.216-.403.395-.872A12.6 12.6 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.96 6.96 0 0 0 14.982 8.5h-2.49a13.4 13.4 0 0 1-.437 3.008M14.982 7.5a6.96 6.96 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008zM11.27 2.461q.266.502.482 1.078a8.4 8.4 0 0 0 1.196-.49 7 7 0 0 0-2.275-1.52c.218.283.418.597.597.932m-.488 1.343a8 8 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z"/>
              </svg>
              Links
            </NavLink>
          }

          <div className="w-full border-b-2 border-slate-800 rounded-md"></div>
        </nav>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-800">
        {/* Top Navigation */}
        <header className="bg-gray-800 text-white px-6 py-4 flex justify-between sm:flex-row flex-col-reverse items-center">
          {/* Animation */}

          <div className="flex space-x-4">
            <div className="my-auto w-6 h-6 bg-white opacity-30 relative rounded-md animate-slowRotate">
                <div className="absolute inset-0 bg-white animate-slowPingRotate rounded-md"></div>
            </div>
            <span className="text-xl">Dashboard Overview</span>
          </div>

          <div className="flex space-x-4">
            <Form method="post">
              <button type="submit"
                className="w-full px-4 py-2 rounded bg-rose-900 hover:bg-rose-600"
              >
                Logout
              </button>
            </Form>
            <Link to={`/dashboard/user/settings/${user.id}`} >
              <button className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
                ⚙
              </button>
            </Link>

          </div>
        </header>
        
        {/* Animation */}
        {/* <div className="w-6 h-6 bg-white relative rounded-md animate-slowRotate">
            <div className="absolute inset-0 bg-white animate-slowPingRotate rounded-md"></div>
        </div> */}

        {/* Content Area */}
        {/* <main className="p-6 flex-1"> */}
        <main className="p-6 flex-row ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
