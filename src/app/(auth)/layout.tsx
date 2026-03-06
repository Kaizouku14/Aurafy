import { PAGE_ROUTES } from "@/constants/page-routes";
import { getSession } from "@/server/better-auth";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();

  if (session) {
    redirect(PAGE_ROUTES.HOME);
  }

  return <div className="h-screen">{children}</div>;
};

export default Layout;
