import React, { useState } from "react";
import "../styles.css";

export default function Dictionary() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [definition, setDefinition] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // ✅ CRA syntax (NOT import.meta.env)
  const PIXABAY_KEY = process.env.REACT_APP_PIXABAY_KEY;

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setDefinition(null);
    setImageUrl("");

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
      setDefinition(dictJson[0]);

      // Pixabay API
      if (!PIXABAY_KEY) {
        console.warn("Missing REACT_APP_PIXABAY_KEY in build.");
      } else {
        const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(
          word
        )}&image_type=photo&per_page=3&safesearch=true`;

        const pixRes = await fetch(url);
        if (!pixRes.ok) throw new Error(`Pixabay HTTP ${pixRes.status}`);

        const pixJson = await pixRes.json();
        const first = pixJson?.hits?.[0]?.webformatURL;
        if (first) setImageUrl(first);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Try another word.");
    } finally {
      setLoading(false);
    }
  }

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
              {definition.phonetics?.[0]?.audio && (
                <audio controls className="audio">
                  <source src={definition.phonetics[0].audio} type="audio/mpeg" />
                </audio>
              )}
            </>
          ) : (
            <div className="placeholder">Search a word to see its meaning</div>
          )}
        </div>

        <div className="image-card">
          {imageUrl ? (
            <img src={imageUrl} alt={word} className="word-image" />
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
