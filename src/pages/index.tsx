import type { NextPage } from "next";
import { useId, useState } from "react";

const Home: NextPage = () => {
  const [text, setText] = useState("");
  const [displayWordsNum, setDisplayWordsNum] = useState(2);
  const [padWordsNum, setPadWordsNum] = useState(2);
  const [position, setPosition] = useState(0);
  const displayWordsId = useId();
  const padWordsId = useId();

  const words = text.split(/\s+/).filter((word) => word.length > 0);

  const firstPaddedWords = words
    .slice(Math.max(0, position - padWordsNum), position)
    .join(" ");
  const displayedWords = words
    .slice(position, position + displayWordsNum)
    .join(" ");
  const secondPaddedWords = words
    .slice(position + displayWordsNum, position + displayWordsNum + padWordsNum)
    .join(" ");

  return (
    <>
      <h1 className="text-center text-5xl">Tedious Handwriting</h1>
      <textarea
        cols={30}
        rows={10}
        className="rounded border border-solid border-gray-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <p className="">
        {firstPaddedWords && (
          <>
            <span>{firstPaddedWords}</span>{" "}
          </>
        )}
        <span className="bg-yellow-200">{displayedWords}</span>
        {secondPaddedWords && (
          <>
            {" "}
            <span>{secondPaddedWords}</span>
          </>
        )}
      </p>
      <button
        onClick={() =>
          setPosition((p) => {
            const next = Math.min(p + displayWordsNum, words.length - 1);
            if (next < p + displayWordsNum) return p;
            return next;
          })
        }
        className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
      >
        Increase position ({position})
      </button>
      <button
        onClick={() => setPosition((p) => Math.max(0, p - displayWordsNum))}
        className="rounded bg-red-500 py-2 px-4 font-bold text-white hover:bg-red-700"
      >
        Decrease position ({position})
      </button>
      <div>
        <label htmlFor={displayWordsId}>Display words</label>
        <input
          type="number"
          value={displayWordsNum}
          min={1}
          max={5}
          id={displayWordsId}
          className="w-12 rounded border border-solid border-gray-500 text-right"
          onChange={(e) => setDisplayWordsNum(parseInt(e.target.value))}
        />
        <label htmlFor={padWordsId}>Pad words</label>
        <input
          type="number"
          value={padWordsNum}
          min={0}
          max={5}
          id={padWordsId}
          className="w-12 rounded border border-solid border-gray-500 text-right"
          onChange={(e) => setPadWordsNum(parseInt(e.target.value))}
        />
      </div>
    </>
  );
};

export default Home;
