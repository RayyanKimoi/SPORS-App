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

  a {
    color: ${Colors.primary};
    text-decoration: none;
  }

  a:hover {
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
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${Colors.surfaceContainer};
  }

  ::-webkit-scrollbar-thumb {
    background: ${Colors.outline};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${Colors.onSurfaceVariant};
  }

  /* Fix autofill styling for better appearance */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-background-clip: text;
    -webkit-text-fill-color: ${Colors.onSurface} !important;
    transition: background-color 5000s ease-in-out 0s;
    box-shadow: inset 0 0 20px 20px ${Colors.surfaceContainerHigh};
  }

  /* Focus state for input wrapper */
  .input-wrapper:focus-within {
    border-color: ${Colors.primary} !important;
  }

  /* Placeholder styling */
  input::placeholder {
    color: ${Colors.outline};
    opacity: 0.7;
  }

  input:focus::placeholder {
    opacity: 0.5;
  }
`
