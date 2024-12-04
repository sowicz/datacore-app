import { LoaderFunction, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getUser } from "~/utils/session.server";


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
  } else {
    return redirect('/dashboard/users/list')
  }
};


export default function Users() {

  return (
    <div className="mt-12">
      <Outlet />
    </div>

  );
}
