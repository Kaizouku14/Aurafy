import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  rotation: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  desc,
  rotation,
}) => {
  return (
    <div
      className={cn(
        "bg-background border-border shadow-shadow-sm border-[3px] p-3 sm:p-4",
        rotation,
      )}
    >
      <div className="bg-main text-main-foreground border-border mb-2 sm:mb-3 flex size-7 sm:size-8 items-center justify-center border-2">
        {icon}
      </div>
      <h3 className="text-xs sm:text-sm font-black tracking-tight uppercase">{title}</h3>
      <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs leading-tight font-medium">
        {desc}
      </p>
    </div>
  );
};

export default FeatureCard;
