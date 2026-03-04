import { BookA, MessageCircleMore } from "lucide-react";
import { Button } from "../ui/button";

const Header = () => {
  return (
    <div className="flex justify-between py-4">
      <div className="text-main-foreground bg-main border-border shadow-shadow rounded-xl border-2 p-2">
        <BookA />
      </div>

      <div>Logout</div>
    </div>
  );
};

export default Header;
