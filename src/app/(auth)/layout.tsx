const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full items-center justify-between">
      <div className="">Test</div>
      {children}
    </div>
  );
};

export default Layout;
