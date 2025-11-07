import React from "react";
import Dictionary from "./Dictionary.jsx";
import "./App.css";

export default function App() {
  return (
    <>
      <main>
        <Dictionary />
      </main>

      <footer className="site-footer">
        This project was coded by{" "}
        <a
          href="https://github.com/simcamelia"
          target="_blank"
          rel="noreferrer"
        >
          Camelia Simion
        </a>{" "}
        and is{" "}
        <a
          href="https://github.com/simcamelia/dictionary"
          target="_blank"
          rel="noreferrer"
        >
          open-sourced on GitHub
        </a>{" "}
        and hosted on{" "}
        <a
          href="https://dictionarycs.netlify.app/"
          target="_blank"
          rel="noreferrer"
        >
          Netlify
        </a>
        .
      </footer>
    </>
  );
}
