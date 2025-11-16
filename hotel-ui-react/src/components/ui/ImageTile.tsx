import styles from "./ImageTile.module.css";

type ImageTileProps = {
  src?: string;
  alt?: string;
  caption?: string;
  placeholder?: boolean;
};

export default function ImageTile({
  src,
  alt = "",
  caption,
  placeholder,
}: ImageTileProps) {
  return (
    <div className={styles.tile} aria-label={caption || alt}>
      {placeholder ? (
        <span>Illustration</span>
      ) : (
        <img className={styles.image} src={src} alt={alt} />
      )}
      {caption ? <span className={styles.caption}>{caption}</span> : null}
    </div>
  );
}
