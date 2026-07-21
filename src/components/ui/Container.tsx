import { cn } from "@/lib/cn";

type ContainerProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav";
};

export function Container({
  children,
  className,
  as: Tag = "div",
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
