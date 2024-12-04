import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUser } from "~/utils/session.server";
import { db } from "~/utils/db.server";

type Links = {
  id: number,
  link: string,
  name: string,
}

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUser(request);
  if (!user || user.role !== "admin") {
    return redirect("/login");
  }
  const links = await db.links.findMany({
    select: {
      id: true,
      link: true,
      name: true,
    },
  });
  return ({ links, user });
};


export default function Users() {
  const { links } = useLoaderData<typeof loader>();
  const { user } = useLoaderData<typeof loader>();



  return (
    <div className="mt-12">
      {links.length === 0 ? (
        <p className="text-slate-500 text-center">No links found.</p>
      ) : (
        <div className="relative overflow-x-auto shadow-xl rounded ">
          <table className="min-w-full table-auto border-collapse rounded-md">
            <thead className="">
              <tr className="bg-slate-700 border-b border-slate-600 rounded-md text-slate-300">
                <th className="px-4 py-2 text-left font-semibold">id</th>
                <th className="px-4 py-2 text-left font-semibold">Link</th>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {links.map((link: Links) => (
                <tr key={link.id} className="border-b border-slate-600 text-slate-300">
                  <td className="px-4 py-2">{link.id}</td>
                  <td className="px-4 py-2">{link.link}</td>
                  <td className="px-4 py-2">{link.name}</td>

                  <td className="px-4 py-2">
                    {/* Check if user role is admin to hide edit button */}
                    {user.role !== "admin" ? null :
                    <Link to={`/dashboard/links/edit/${link.id}`}>
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
        <Link to={`/dashboard/links/add-link`}>
          <button className="bg-blue-900 hover:bg-blue-700 p-2 rounded-md text-slate-300 ">Add new link</button>
        </Link>
      </div>
    </div>
  );
}
