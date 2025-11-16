import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className={styles.wrap}>
      {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.desc}>{description}</p> : null}
      <div className={styles.divider} />
    </div>
  );
}
