import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

export default function Button({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  const extra = className ? ` ${className}` : "";
  const variantClass = variant === "secondary" ? styles.buttonSecondary : "";
  const widthClass = fullWidth ? styles.fullWidth : "";
  const classes =
    `${styles.button}${extra} ${variantClass} ${widthClass}`.trim();
  return <button className={classes} {...props} />;
}
