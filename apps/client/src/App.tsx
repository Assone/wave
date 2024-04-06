import { Outlet } from "@tanstack/react-router";

const App: React.FC = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export default App;
