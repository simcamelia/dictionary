import React, { useEffect, useState } from "react";
import "./Dictionary.css";

export default function Dictionary() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [entry, setEntry] = useState(null);
  const [images, setImages] = useState([]);
  const [imgError, setImgError] = useState(false);

  // --- THEME: load -> apply -> persist ---
  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  // --- Pixabay key (CRA env) ---
  const PIXABAY_KEY = process.env.REACT_APP_PIXABAY_KEY;

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setEntry(null);
    setImages([]);
    setImgError(false);

    try {
      // Dictionary API
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
          word
        )}`
      );
      if (!dictRes.ok) throw new Error(`Dictionary HTTP ${dictRes.status}`);
      const dictJson = await dictRes.json();
      if (!Array.isArray(dictJson) || !dictJson[0]) {
        throw new Error("No definition found.");
      }
      const firstEntry = dictJson[0];
      setEntry(firstEntry);

      // Pixabay API (gallery)
      if (PIXABAY_KEY) {
        const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(
          word
        )}&image_type=photo&per_page=12&safesearch=true`;
        const pixRes = await fetch(url);
        if (pixRes.ok) {
          const pixJson = await pixRes.json();
          const hits = (pixJson?.hits || [])
            .map((h) => h?.webformatURL || h?.largeImageURL || h?.previewURL)
            .filter(Boolean)
            .slice(0, 6)
            .map((u) => u.replace(/^http:/, "https:"));
          setImages(hits);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Try another word.");
    } finally {
      setLoading(false);
    }
  }

  const audioUrl = entry?.phonetics?.find((p) => p?.audio)?.audio || "";
  const phoneticText =
    entry?.phonetics?.find((p) => p?.text)?.text ||
    entry?.phonetics?.[0]?.text ||
    "";

  const totalMeanings = entry?.meanings?.reduce(
    (sum, m) => sum + (m?.definitions?.length || 0),
    0
  );

  return (
    <div className="dictionary-container">
      {/* Fixed background layer */}
      <div className="page-bg" aria-hidden="true" />

      <header className="topbar">
        <h1 className="title">
          <span className="title-icon" role="img" aria-label="rainbow">
            🌈
          </span>
          Dictionary
        </h1>
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle light/dark theme"
          title="Toggle light/dark theme"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <p className="subtitle">Meanings, examples & images for any word</p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search a word..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="search-input"
          required
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="results">
        <div className="definition-card">
          {loading && !entry ? (
            <div className="skeleton">
              <div className="sk-line sk-title" />
              <div className="sk-line" />
              <div className="sk-line" />
              <div className="sk-line short" />
            </div>
          ) : entry ? (
            <>
              <div className="header-row">
                <div>
                  <h2 className="word">{entry.word}</h2>
                  {phoneticText && (
                    <div className="phonetic">{phoneticText}</div>
                  )}
                </div>
                {typeof totalMeanings === "number" && totalMeanings > 0 && (
                  <span className="badge">{totalMeanings} definitions</span>
                )}
              </div>

              {audioUrl && (
                <audio controls className="audio">
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>
              )}

              <div className="meanings">
                {(entry.meanings || []).map((m, i) => (
                  <section key={i} className="meaning-block">
                    {m.partOfSpeech ? (
                      <h3 className="pos chip">{m.partOfSpeech}</h3>
                    ) : null}

                    <ol className="definitions-list">
                      {(m.definitions || []).map((d, j) => (
                        <li key={j} className="definition-item">
                          <div className="definition-text">{d?.definition}</div>

                          {d?.example ? (
                            <div className="example">“{d.example}”</div>
                          ) : null}

                          {(d?.synonyms?.length || d?.antonyms?.length) ? (
                            <div className="sa-row">
                              {d?.synonyms?.length ? (
                                <div className="synonyms">
                                  <span className="label">Synonyms:</span>{" "}
                                  {d.synonyms.slice(0, 10).join(", ")}
                                  {d.synonyms.length > 10 ? " …" : ""}
                                </div>
                              ) : null}
                              {d?.antonyms?.length ? (
                                <div className="antonyms">
                                  <span className="label">Antonyms:</span>{" "}
                                  {d.antonyms.slice(0, 10).join(", ")}
                                  {d.antonyms.length > 10 ? " …" : ""}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            </>
          ) : (
            <div className="placeholder">Search a word to see its meaning</div>
          )}
        </div>

        <div className="image-card">
          {loading && images.length === 0 ? (
            <div className="gallery skeleton">
              <div className="sk-tile" />
              <div className="sk-tile" />
              <div className="sk-tile" />
            </div>
          ) : images.length ? (
            <div className="gallery">
              {images.map((src, i) => (
                <a
                  className="img-wrap"
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  onError={() => setImgError(true)}
                >
                  <img src={src} alt={`${word} ${i + 1}`} />
                </a>
              ))}
            </div>
          ) : (
            <div className="placeholder">
              {loading ? "Fetching image..." : "No image yet — search a word"}
            </div>
          )}
          {imgError && (
            <div className="error small">Some images failed to load.</div>
          )}
        </div>
      </div>
    </div>
  );
}
