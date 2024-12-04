import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getUser, destroyUserSession } from "~/utils/session.server"; // Your session utility to get the logged-in user
import { db } from "~/utils/db.server";

export const loader = async ({ request }: { request: Request }) => {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  // return { user }

  const links = await db.links.findMany({
    select: {
      id: true,
      link: true,
      name: true,
    },
  });
  return ({ links });
};


// Action function to handle logout
export const action = async ({ request }: { request: Request }) => {
  return destroyUserSession(request);
};



export default function DashboardIndex() {
  const { links } = useLoaderData<typeof loader>();


    // Utility to normalize links
    const normalizeUrl = (url: string) => {
      return url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `http://${url}`;
    };


  return (
    <div className="mt-12">
      {links.length === 0 ? (
        <p className="text-slate-500 text-center text-lg">No links added</p>
      ) : (
        <div className="lg:w-1/2 w-11/12 mx-auto lg:ml-8 relative overflow-x-auto shadow-lg rounded bg-slate-800">
          <table className="w-full table-auto border-collapse md:text-2xl text-slate-300">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-600 ">
                <th className="px-2 py-3 text-left font-semibold tracking-wide">
                  Links
                </th>
                <th className="px-2 py-3 text-center font-semibold tracking-wide">
                  
                </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr
                  key={link.id}
                  className="border-b border-slate-700 hover:bg-slate-700"
                >
                  {/* Name Column */}
                  <td className="px-2 py-2">{link.name}</td>

                  {/* Action Column with Link */}
                  <td className="px-2 py-2 text-center">
                    <a
                      href={normalizeUrl(link.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center md:text-xl bg-blue-800 hover:bg-blue-700 text-white py-1 px-2 rounded transition-all"
                      title={`Visit ${link.name}`}
                    >
                      Visit
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M0 8a8 8 0 1 0 16 0A8 8 0 0 0 0 8m5.904 2.803a.5.5 0 1 1-.707-.707L9.293 6H6.525a.5.5 0 1 1 0-1H10.5a.5.5 0 0 1 .5.5v3.975a.5.5 0 0 1-1 0V6.707z" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
