"use client";
import {
  createContext,
  useContext,
  useId,
  cloneElement,
  isValidElement,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { GameState } from "@/lib/engine";
export type GameContextValue = {
  state: GameState;
  setState: Dispatch<SetStateAction<GameState>>;
  navigate: (view: string) => void;
  toast: (message: string) => void;
};
export const GameContext = createContext<GameContextValue>(null!);
export const useGame = () => useContext(GameContext);
export function useWorkDraft<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const { state, setState } = useGame();
  const draftKey = `${state.assessment && state.assessment.missionId === state.active ? state.assessment.id : state.active}:${key}`;
  let value = initial;
  try {
    const raw = state.drafts[draftKey];
    if (raw) {
      const parsed = JSON.parse(raw);
      const compatible = Array.isArray(initial)
        ? Array.isArray(parsed)
        : initial && typeof initial === "object"
          ? parsed &&
            Object.keys(initial).every(
              (k) =>
                typeof parsed[k] ===
                typeof (initial as Record<string, unknown>)[k],
            )
          : typeof parsed === typeof initial;
      if (compatible) value = parsed;
    }
  } catch {
    /* An interrupted draft falls back to its initial value. */
  }
  const update: Dispatch<SetStateAction<T>> = (next) =>
    setState((s) => {
      let previous = initial;
      try {
        previous = JSON.parse(s.drafts[draftKey] || JSON.stringify(initial));
      } catch {}
      return {
        ...s,
        drafts: {
          ...s.drafts,
          [draftKey]: JSON.stringify(
            typeof next === "function"
              ? (next as (value: T) => T)(previous)
              : next,
          ),
        },
      };
    });
  return [value, update];
}
export function SectionHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{ id?: string; "aria-label"?: string }>,
            { id, "aria-label": label },
          )
        : children}
    </div>
  );
}
export function Feedback({ text }: { text: string }) {
  return text ? (
    <div className="feedback" role="status">
      {text}
    </div>
  ) : null;
}
