import type { NextPage } from "next";
import { useId, useState } from "react";

type NonFunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

const speakWords = (
  wordsToSpeak: string,
  speechSynthesisSettings: Partial<
    NonFunctionProperties<SpeechSynthesisUtterance>
  >
) => {
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = wordsToSpeak;
  Object.assign(utterance, speechSynthesisSettings);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const Home: NextPage = () => {
  const [text, setText] = useState("");
  const [displayWordsNum, setDisplayWordsNum] = useState(2);
  const [padWordsNum, setPadWordsNum] = useState(2);
  const [position, setPosition] = useState(0);
  const displayWordsId = useId();
  const padWordsId = useId();
  const [speechSynthesisSettings, setSpeechSynthesisSettings] = useState<
    Partial<NonFunctionProperties<SpeechSynthesisUtterance>>
  >({});

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

  const nextPosition = () =>
    setPosition((p) => {
      const next = Math.min(p + displayWordsNum, words.length - 1);
      if (next < p + displayWordsNum) return p;
      return next;
    });

  const previousPosition = () =>
    setPosition((p) => Math.max(0, p - displayWordsNum));

  const resetPosition = () => setPosition(0);

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
        onClick={previousPosition}
        className="rounded bg-red-500 py-2 px-4 font-bold text-white hover:bg-red-700"
      >
        Decrease position ({position})
      </button>
      <button
        onClick={nextPosition}
        className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
      >
        Increase position ({position})
      </button>
      <button
        className="rounded bg-pink-500 py-2 px-4 font-bold text-white hover:bg-pink-700"
        onClick={() => speakWords(displayedWords, speechSynthesisSettings)}
      >
        Speak
      </button>
      <button
        className=" rounded bg-purple-500 py-2 px-4 font-bold text-white hover:bg-purple-700"
        onClick={resetPosition}
      >
        Reset position
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
          onChange={(e) =>
            setDisplayWordsNum(clamp(parseInt(e.target.value), 1, 5))
          }
        />
        <label htmlFor={padWordsId}>Pad words</label>
        <input
          type="number"
          value={padWordsNum}
          min={0}
          max={5}
          id={padWordsId}
          className="w-12 rounded border border-solid border-gray-500 text-right"
          onChange={(e) =>
            setPadWordsNum(clamp(parseInt(e.target.value), 0, 5))
          }
        />
      </div>
    </>
  );
};

export default Home;
