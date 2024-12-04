import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser } from "~/utils/session.server"; // Your session utility to get the logged-in user
import { getDockerContainers } from "~/utils/docker.server";





export const loader = async ({ request }: { request: Request }) => {
  const user = await getUser(request); // Fetch the logged-in user
  if (!user) {
    return redirect("/login"); // Redirect if no user is logged in
  }
  const containers = await getDockerContainers(); // Fetch docker containers
  return { containers }  
};



export default function Docker() {
  const { containers } = useLoaderData<typeof loader>();


return (
  <div className="container mx-auto mt-12">
    <div className="bg-slate-700 p-6 rounded shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-slate-300">Containers</h3>
      {containers.length === 0 ? (
        <p className="text-slate-300">No containers running.</p>
      ) : (
        <table className="min-w-full table-auto ">
          <thead>
            <tr className="text-slate-300">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">is running</th>
            </tr>
          </thead>
          <tbody>
            {containers.map((container, index) => {
              // Split the container name and status
              const [containerName, status] = container.split(":");

              // Determine color based on status
              const isUp = status.includes("Up");
              const statusIcon = isUp ? (
                <span className="text-green-500">&#x2714;</span> // Checkmark for Up
              ) : (
                <span className="text-red-500">&#x274C;</span> // Cross for Down
              );

              return (
                <tr key={index} className="border-b border-slate-600 text-slate-400">
                  <td className="px-4 py-2">{containerName}</td>
                  <td className="px-4 py-2">
                    <div
                      className={`px-4 py-2`}
                    >
                      {status}
                    </div>
                  </td>
                  <td className="px-4 py-2">{statusIcon}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  </div>

)
}