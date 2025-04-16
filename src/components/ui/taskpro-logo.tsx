
import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface TaskProLogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
  withText?: boolean;
  textClassName?: string;
}

export const TaskProLogo: FC<TaskProLogoProps> = ({
  className = "",
  size = "medium",
  withText = true,
  textClassName = "",
}) => {
  const navigate = useNavigate();

  // Size mapping for the logo
  const sizeMap = {
    small: "h-8 w-8",
    medium: "h-10 w-10",
    large: "h-12 w-12",
  };

  // Text size mapping
  const textSizeMap = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl",
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className={`flex items-center cursor-pointer ${className}`} onClick={handleLogoClick}>
      <div className={`${sizeMap[size]} rounded-md bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center`}>
        <span className="text-white font-bold">T</span>
      </div>
      {withText && (
        <h1 className={`ml-2 font-bold tracking-tight ${textSizeMap[size]} ${textClassName || "bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600"}`}>
          TaskPro
        </h1>
      )}
    </div>
  );
};
