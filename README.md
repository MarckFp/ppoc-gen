# PPOC Gen

PPOC Gen, it's a web application in charge of managing the schedules and turns for the public preaching of the Jehovah's witnesses.


It is built using svelte and tauri and IndexedDB as storage. I made the decision of using a database that stores the data locally to prevent any leaks of information and save costs of using servers and externally located databases, unfortunatelly this prevent us to use any type of sync with the data we use.


## Requirements

- Bun 1.x
- Tauri 1.x
- Svelte 4.x

## Local Usage

To make the application work locally we need to:

- Install all dependencies with bun
```bash
bun install
```

- Then we can run the development server using
```bash
bun run dev
```

- Or we can build the binaries using tauri
```bash
bun run tauri dev
```

This last step is in charge of:

- Building the binaries for the webserver
- Building the binaries for the current OS application
