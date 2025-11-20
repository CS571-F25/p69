# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


THE PLAN:

It requires 3 pages, ours only really needs 2, but we can expand

PAGE 1:
- trick ski calculator page
- looks like a calculator
Components:
- Trick button
- Trick type button (wake, toes, line, etc)
- special components for undo, clear, and other utilities

PAGE 2:
- Construct and share your run screen
- It'll show your run and associated points
- pass object from pg 1 here
- list each trick
- Shareable links / formats

PAGE 3:
- trick ski tricks handbook and other rules
- purely information
- Text box components? idk it's static


Future expansion ideas

PAGE 2 could have a way to save your run and compare it to other runs
PAGE 1 could have a way to predict the next trick like in eyetrick
PAGE 4 could be cow game
PAGE 1 could have a secret 4th event menu
PAGE 2 could have a stats screen to document your progress/consistency per run

