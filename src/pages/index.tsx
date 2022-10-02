import type { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const [text, setText] = useState("");
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const [displayWords, setDisplayWords] = useState(2);
  const [padWords, setPadWords] = useState(2);
  const [position, setPosition] = useState(0);

  return (
    <>
      <h1 className="text-center text-5xl">Tedious Handwriting</h1>
      <textarea
        cols={30}
        rows={10}
        className="rounded border-[1px] border-solid border-gray-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <p className="">
        {position > 0 && (
          <>
            <span>
              {words
                .slice(Math.max(0, position - padWords), position)
                .join(" ")}
            </span>{" "}
          </>
        )}
        <span className="bg-yellow-200">
          {words.slice(position, position + displayWords).join(" ")}
        </span>
        {position + displayWords < words.length && (
          <>
            {" "}
            <span>
              {words
                .slice(
                  position + displayWords,
                  position + displayWords + padWords
                )
                .join(" ")}
            </span>
          </>
        )}
      </p>
      <button
        onClick={() =>
          setPosition((p) => {
            const next = Math.min(p + displayWords, words.length - 1);
            if (next < p + displayWords) return p;
            return next;
          })
        }
        className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
      >
        Increase position ({position})
      </button>
      <button
        onClick={() => setPosition((p) => Math.max(0, p - displayWords))}
        className="rounded bg-red-500 py-2 px-4 font-bold text-white hover:bg-red-700"
      >
        Decrease position ({position})
      </button>
      <div>
        <label>Display words</label>
        <input
          type="number"
          value={displayWords}
          min={1}
          max={5}
          className="w-12 rounded border-[1px] border-solid border-gray-500 text-right"
          onChange={(e) => setDisplayWords(parseInt(e.target.value))}
        />
        <label>Pad words</label>
        <input
          type="number"
          value={padWords}
          min={0}
          max={5}
          className="w-12 rounded border-[1px] border-solid border-gray-500 text-right"
          onChange={(e) => setPadWords(parseInt(e.target.value))}
        />
      </div>
    </>
  );
};

export default Home;
