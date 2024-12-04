import { LoaderFunction, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getUser } from "~/utils/session.server";



export const loader: LoaderFunction = async ({request}) => {
  const user = await getUser(request);
  if (!user || user.role !== "admin") {
    return redirect("/login");
  } else {
    return redirect('/dashboard/links/list')
  }
};


export default function Links() {

  return (
    <div className="mt-12">
      <Outlet />
    </div>

  );
}
