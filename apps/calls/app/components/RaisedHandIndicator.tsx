import { Hand } from "lucide-react";

const RaisedHandIndicator: React.FC = () => {
  return (
    <div className="relative">
      <Hand color="#fff" size={16} />
      <Hand
        color="orange"
        size={16}
        className="animate-ping absolute inset-0"
      />
    </div>
  );
};

export default RaisedHandIndicator;
