import { Colors } from '../lib/colors'

export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: ${Colors.background};
    color: ${Colors.onSurface};
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
  }

  .app-layout a {
    color: ${Colors.primary};
    text-decoration: none;
  }

  .app-layout a:hover {
    text-decoration: underline;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  input, textarea, select {
    font-family: inherit;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${Colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: #D4D4D4;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #A3A3A3;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-background-clip: text;
    -webkit-text-fill-color: ${Colors.onSurface} !important;
    transition: background-color 5000s ease-in-out 0s;
    box-shadow: inset 0 0 20px 20px #fff;
  }

  .input-wrapper:focus-within {
    border-color: #000 !important;
  }

  input::placeholder {
    color: #A3A3A3;
    opacity: 0.8;
  }

  input:focus::placeholder {
    opacity: 0.5;
  }

  /* Grid background for app layout */
  .app-layout main {
    background-image:
      linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
    background-size: 50px 50px;
  }
`
