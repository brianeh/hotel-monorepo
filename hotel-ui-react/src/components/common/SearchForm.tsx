import { FormEvent, useState } from "react";
import styles from "./SearchForm.module.css";

function preventDefault(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

export default function SearchForm() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <form className={styles.searchForm} onSubmit={preventDefault} role="search">
      <input
        className={styles.searchInput}
        type="search"
        placeholder="Search"
        aria-label="Search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <button type="submit" className={styles.searchButton}>
        Search
      </button>
    </form>
  );
}
