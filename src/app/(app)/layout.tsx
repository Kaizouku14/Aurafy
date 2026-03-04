import Header from "@/components/layout/header";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col gap-4 p-4">
      {/*<Header />*/}
      <div>{children}</div>
    </main>
  );
};

export default Layout;
