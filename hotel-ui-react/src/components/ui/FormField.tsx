import { ReactNode } from "react";
import styles from "./FormField.module.css";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  );
}
