interface LogoProps {
  className?: string;
}

const Logo = ({ className = "text-xl" }: LogoProps) => (
  <span className={`font-bold tracking-tight text-foreground ${className}`}>
    todo<span className="text-primary">.</span>
  </span>
);

export default Logo;
