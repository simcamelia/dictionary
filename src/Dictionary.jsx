import React, { useState } from "react";
import "./Dictionary.css";

export default function Dictionary() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [entry, setEntry] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imgError, setImgError] = useState(false);

  const PIXABAY_KEY = process.env.REACT_APP_PIXABAY_KEY;

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setEntry(null);
    setImageUrl("");
    setImgError(false);

    try {
      // Dictionary API
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );
      if (!dictRes.ok) throw new Error(`Dictionary HTTP ${dictRes.status}`);
      const dictJson = await dictRes.json();
      if (!Array.isArray(dictJson) || !dictJson[0]) {
        throw new Error("No definition found.");
      }
      const firstEntry = dictJson[0];
      setEntry(firstEntry);

      // Pixabay API
      if (PIXABAY_KEY) {
        const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(
          word
        )}&image_type=photo&per_page=5&safesearch=true`;
        const pixRes = await fetch(url);
        if (pixRes.ok) {
          const pixJson = await pixRes.json();
          const hit =
            (pixJson?.hits || []).find(
              (h) => typeof h?.webformatURL === "string" && /^(http|https):/.test(h.webformatURL)
            ) || pixJson?.hits?.[0];
          const firstUrl = hit?.webformatURL || hit?.largeImageURL || hit?.previewURL || "";
          setImageUrl(firstUrl ? firstUrl.replace(/^http:/, "https:") : "");
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

  return (
    <div className="dictionary-container">
      <h1 className="title">
        <span className="title-icon" role="img" aria-label="rainbow">🌈</span>
        Dictionary
      </h1>

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
          {entry ? (
            <>
              <h2 className="word">{entry.word}</h2>
              {phoneticText && <div className="phonetic">{phoneticText}</div>}
              {audioUrl && (
                <audio controls className="audio">
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>
              )}

              <div className="meanings">
                {(entry.meanings || []).map((m, i) => (
                  <section key={i} className="meaning-block">
                    {m.partOfSpeech ? <h3 className="pos">{m.partOfSpeech}</h3> : null}

                    <ol className="definitions-list">
                      {(m.definitions || []).map((d, j) => (
                        <li key={j} className="definition-item">
                          <div className="definition-text">{d?.definition}</div>

                          {d?.example ? <div className="example">“{d.example}”</div> : null}

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

              {(entry.sourceUrls?.length || entry.license) ? (
                <div className="source">
                  {entry.sourceUrls?.[0] ? (
                    <a href={entry.sourceUrls[0]} target="_blank" rel="noreferrer">Source</a>
                  ) : null}
                  {entry.license?.name ? <span className="license"> · {entry.license.name}</span> : null}
                </div>
              ) : null}
            </>
          ) : (
            <div className="placeholder">Search a word to see its meaning</div>
          )}
        </div>

        <div className="image-card">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={word}
              className="word-image"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="placeholder">
              {loading ? "Fetching image..." : "No image yet — search a word"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
