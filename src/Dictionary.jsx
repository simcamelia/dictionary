import React, { useState } from "react";
import "./Dictionary.css";

export default function Dictionary() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [definition, setDefinition] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // CRA environment variable
  const PIXABAY_KEY = process.env.REACT_APP_PIXABAY_KEY;

  // diagnostic logs (you can remove later)
  console.log("[Pixabay] key present?", Boolean(PIXABAY_KEY));
  console.log("[Pixabay] Using Dictionary.jsx");

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setDefinition(null);
    setImageUrl("");

    try {
      // === Dictionary API ===
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

      // === Pixabay API ===
      if (!PIXABAY_KEY) {
        console.warn("Missing REACT_APP_PIXABAY_KEY in build.");
      } else {
        const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(
          word
        )}&image_type=photo&per_page=3&safesearch=true`;

        const pixRes = await fetch(url);
        if (!pixRes.ok) throw new Error(`Pixabay HTTP ${pixRes.status}`);
        const pixJson = await pixRes.json();

        console.log("[Pixabay] hits:", pixJson?.hits?.length, pixJson);

        const firstUrl =
          pixJson?.hits?.[0]?.webformatURL ||
          pixJson?.hits?.[0]?.largeImageURL ||
          "";
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

  // safely choose an audio URL
  const audioUrl =
    definition?.phonetics?.find((p) => p?.audio)?.audio || "";

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
          {imageUrl ? (
            <>
              <img src={imageUrl} alt={word} className="word-image" />
              <p className="debug">
                <a href={imageUrl} target="_blank" rel="noreferrer">
                  Open image
                </a>
              </p>
            </>
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
