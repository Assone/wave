import useOnce from "@/hooks/useOnce";

const DebugTools: React.FC = ({}) => {
  useOnce(() => {
    import("eruda").then((eruda) => eruda.default.init());
  });

  return null;
};

export default DebugTools;
