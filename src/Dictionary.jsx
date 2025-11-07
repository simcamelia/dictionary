import React, { useState } from "react";
import "./Dictionary.css";

export default function Dictionary() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [definition, setDefinition] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imgError, setImgError] = useState(false);

  // CRA env var
  const PIXABAY_KEY = process.env.REACT_APP_PIXABAY_KEY;

  // temporary diagnostics
  console.log("[Pixabay] key present?", Boolean(PIXABAY_KEY));

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setDefinition(null);
    setImageUrl("");
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
      const entry = dictJson[0];
      setDefinition(entry);

      // Pixabay API
      if (!PIXABAY_KEY) {
        console.warn("Missing REACT_APP_PIXABAY_KEY in build.");
      } else {
        const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(
          word
        )}&image_type=photo&per_page=5&safesearch=true`;

        const pixRes = await fetch(url);
        if (!pixRes.ok) throw new Error(`Pixabay HTTP ${pixRes.status}`);
        const pixJson = await pixRes.json();

        console.log("[Pixabay] hits:", pixJson?.hits?.length);

        // Pick the first hit that has a usable http(s) URL
        const hit =
          pixJson?.hits?.find(
            (h) =>
              typeof h?.webformatURL === "string" &&
              /^(http|https):/.test(h.webformatURL)
          ) || pixJson?.hits?.[0];

        const firstUrl =
          hit?.webformatURL || hit?.largeImageURL || hit?.previewURL || "";

        // force https just in case (avoid mixed content)
        const safeUrl = firstUrl ? firstUrl.replace(/^http:/, "https:") : "";
        console.log("[Pixabay] imageUrl:", safeUrl);
        setImageUrl(safeUrl);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Try another word.");
    } finally {
      setLoading(false);
    }
  }

  // choose a safe audio URL if present
  const audioUrl = definition?.phonetics?.find((p) => p?.audio)?.audio || "";

  return (
    <div className="dictionary-container">
      <h1 className="title">Dictionary</h1>

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
          {definition ? (
            <>
              <h2 className="word">{definition.word}</h2>
              {definition.phonetics?.[0]?.text && (
                <div className="phonetic">{definition.phonetics[0].text}</div>
              )}
              {definition.meanings?.[0]?.definitions?.[0]?.definition && (
                <p className="meaning">
                  {definition.meanings[0].definitions[0].definition}
                </p>
              )}
              {audioUrl && (
                <audio controls className="audio">
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>
              )}
            </>
          ) : (
            <div className="placeholder">Search a word to see its meaning</div>
          )}
        </div>

        <div className="image-card">
          {imageUrl && !imgError ? (
            <>
              <img
                src={imageUrl}
                alt={word}
                className="word-image"
                onError={() => setImgError(true)}
              />
              <p className="debug">
                <a href={imageUrl} target="_blank" rel="noreferrer">
                  Open image
                </a>
              </p>
            </>
          ) : (
            <div className="placeholder">
              {loading
                ? "Fetching image..."
                : imgError
                ? "Image failed to load (click the debug link below)."
                : "No image yet — search a word"}
              {imageUrl && imgError && (
                <p className="debug">
                  <a href={imageUrl} target="_blank" rel="noreferrer">
                    Open image
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
