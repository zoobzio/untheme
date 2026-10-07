import type { Template } from "untheme";
import type { Entry, Manifest } from "@untheme/kit";
import type { Prose, ProseEntry } from "./types";

/**
 * Returns a display name for an id. The function splits the id on `-`, `_`,
 * and `.` and capitalizes each word. `night_owl` becomes `Night Owl`. The kit
 * applies the same rule to a document that authors no name.
 */
export const title = (id: string): string => {
  return id
    .split(/[-_.\s]+/)
    .filter((word) => word !== "")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
};

/** Returns an entry with the id, the name or the titled id, and the description when set. */
const entry = (id: string, prose: ProseEntry = {}): Entry => {
  const found: Entry = { id, name: prose.name ?? title(id) };
  if (prose.description !== undefined && prose.description !== "") {
    found.description = prose.description;
  }
  return found;
};

/**
 * Returns the manifest of a theme as the kit emits it. The manifest lists
 * every modifier in order. Each modifier lists its contexts in contract
 * order. Each entry has a name and an optional description. Without prose,
 * every name is the titled id and no entry has a description. That is what
 * a build of documents without prose produces. The prose sets the names and
 * descriptions that a test needs, by modifier and by context.
 *
 * @param theme - The theme whose modifiers to describe.
 * @param prose - The names and descriptions of the entries.
 */
export const mockManifest = <T extends Template>(
  theme: T,
  prose: Prose<T> = {},
): Manifest => {
  const authored: Partial<
    Record<
      string,
      ProseEntry & { contexts?: Partial<Record<string, ProseEntry>> }
    >
  > = prose;
  return theme.order.map((modifier) => {
    const about = authored[modifier];
    const contexts = Object.keys(theme.modifiers[modifier] ?? {}).map((id) =>
      entry(id, about?.contexts?.[id]),
    );
    return { ...entry(modifier, about), contexts };
  });
};
