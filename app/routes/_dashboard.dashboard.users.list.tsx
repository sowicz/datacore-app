import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUser } from "~/utils/session.server";
import { db } from "~/utils/db.server";

type Users = {
  id: string,
  username: string,
  role: string,
  createdAt: Date,
}

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUser(request);
  if (!user || user.role !== "admin") {
    return redirect("/login");
  }
  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
  return ({ users });
};


export default function Users() {
  const { users } = useLoaderData<typeof loader>();


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pl-EU", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="mt-12">
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="relative overflow-x-auto shadow-xl rounded ">
          <table className="min-w-full table-auto border-collapse rounded-md">
            <thead className="">
              <tr className="bg-slate-700 border-b border-slate-600 rounded-md text-slate-300">
                <th className="px-4 py-2 text-left font-semibold">Username</th>
                <th className="px-4 py-2 text-left font-semibold">Role</th>
                <th className="px-4 py-2 text-left font-semibold">Created At</th>
                <th className="px-4 py-2 text-left font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: Users) => (
                <tr key={user.id} className="border-b border-slate-600 text-slate-300">
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-white text-sm rounded ${
                        user.role == "admin" ? "bg-blue-500" : "bg-gray-500"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                  {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-2">

                  {/* Check if user role is admin to hide edit button */}
                  {user.role === "admin" ? null :
                  <Link to={`/dashboard/users/edit/${user.id}`}>
                    <button type="submit" 
                      className="text-slate-300 bg-blue-900 hover:bg-blue-800 p-2 rounded-md">
                      Edit
                    </button>
                  </Link>
                  }

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-12 flex flex-row-reverse w-11/12">
        <Link to={`/dashboard/users/create-user`}>
          <button className="bg-blue-900 hover:bg-blue-700 p-2 rounded-md text-slate-300 ">Create new user</button>
        </Link>
      </div>
    </div>
  );
}
