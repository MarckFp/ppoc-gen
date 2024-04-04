import { writable } from "svelte/store";

export let toastMessage = writable('Default message');
export let toastAlert = writable('false');
export let toastWarning = writable('false');
export let toastSuccess = writable('false');
