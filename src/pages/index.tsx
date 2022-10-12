import type { NextPage } from "next";
import { Suspense, useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type SpeechSynthesisSettings = Pick<
  SpeechSynthesisUtterance,
  "voice" | "rate" | "pitch" | "volume"
>;

const voiceSchema: z.ZodType<SpeechSynthesisVoice | null> = z
  .object({
    default: z.boolean(),
    lang: z.string(),
    localService: z.boolean(),
    name: z.string(),
    voiceURI: z.string(),
  })
  .nullable();

const minsAndMaxes: Record<
  "rate" | "pitch" | "volume",
  { min: number; max: number }
> = {
  rate: { min: 0.1, max: 3 },
  pitch: { min: 0.1, max: 2 },
  volume: { min: 0, max: 1 },
};

const getVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return [];
  }
  return new Promise(function (resolve) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      const cb = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", cb);
        resolve(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener("voiceschanged", cb);
    }
  });
};

const SpeechSynthesisSettingsSchema: z.ZodType<SpeechSynthesisSettings> = z
  .object({
    voice: voiceSchema,
    rate: z.number().min(minsAndMaxes.rate.min).max(minsAndMaxes.rate.max),
    pitch: z.number().min(minsAndMaxes.pitch.min).max(minsAndMaxes.pitch.max),
    volume: z
      .number()
      .min(minsAndMaxes.volume.min)
      .max(minsAndMaxes.volume.max),
  })
  .required();

const speakWords = (
  wordsToSpeak: string,
  speechSynthesisSettings: SpeechSynthesisSettings
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const displayWordsId = useId();
  const padWordsId = useId();
  useEffect(() => {
    getVoices().then(setVoices);
  }, []);

  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<SpeechSynthesisSettings>({
    resolver: zodResolver(SpeechSynthesisSettingsSchema),
    mode: "onChange",
    defaultValues: {
      voice: voices[0] ?? null,
      pitch: 1,
      rate: 1,
      volume: 1,
    },
  });

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
        onClick={() => speakWords(displayedWords, getValues())}
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
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Voice</label>
          <select
            {...register("voice", {
              setValueAs: (value) => {
                const voice = voices.find((voice) => voice.name === value);
                return voice ?? null;
              },
            })}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name}
              </option>
            ))}
          </select>
          {errors.voice && <p>{errors.voice.message}</p>}
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Rate</label>
          <input
            type="range"
            min={minsAndMaxes.rate.min}
            max={minsAndMaxes.rate.max}
            step={0.1}
            {...register("rate", {
              valueAsNumber: true,
            })}
          />
          {errors.rate && <p>{errors.rate.message}</p>}
        </div>
        <div>
          <label>Pitch</label>
          <input
            type="range"
            min={minsAndMaxes.pitch.min}
            max={minsAndMaxes.pitch.max}
            step={0.1}
            {...register("pitch", {
              valueAsNumber: true,
            })}
          />
          {errors.pitch && <p>{errors.pitch.message}</p>}
        </div>
        <div>
          <label>Volume</label>
          <input
            type="range"
            min={minsAndMaxes.volume.min}
            max={minsAndMaxes.volume.max}
            step={0.1}
            {...register("volume", {
              valueAsNumber: true,
            })}
          />
          {errors.volume && <p>{errors.volume.message}</p>}
        </div>
      </form>
    </>
  );
};

export default Home;
