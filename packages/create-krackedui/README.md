# create-krackedui

Start a project from a KrackedUI design-system template.

```bash
npm create krackedui@latest my-app -- --system motion --template fintech
cd my-app && npm install && npm run dev
```

Options: `--install` (run npm install), `--force` (write into a non-empty folder), `--version <v>`
(template version), `--list` (show systems and templates). Without flags it asks.

Templates are published as `@krackedui/<system>-template-<template>`; this tool downloads one with
`npm pack`, unpacks it into your folder and turns it into your own private package.
