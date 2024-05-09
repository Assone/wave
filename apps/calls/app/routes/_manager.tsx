import { Outlet, type MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Wave" },
    {
      name: "description",
      content: "Welcome to Wave! Using Vite and Cloudflare!",
    },
  ];
};

const Join: React.FC = () => {
  return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-8">
      <h1 className="text-4xl">🌊 Wave Meets</h1>
      <Outlet />
    </div>
  );
};

export default Join;
