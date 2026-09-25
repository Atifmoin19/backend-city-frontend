import { api } from "./client";
import type { TrackPublic, UserPublic } from "./types";

export const tracksApi = {
  list: () => api<TrackPublic[]>("/content/tracks"),
  interests: () => api<{ tracks: string[] }>("/me/interests"),
  notifyMe: (track: string) =>
    api<{ tracks: string[] }>("/me/interests", { method: "POST", body: { track } }),
  chooseGoal: (track: string) => api<UserPublic>("/me/goal", { method: "PUT", body: { track } }),
};
