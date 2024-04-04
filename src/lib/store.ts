import { writable } from "svelte/store";

export const firstTime = writable(localStorage.getItem("firstTime") || "false");
firstTime.subscribe((val) => localStorage.setItem("firstTime", val));