# Freecell-React Setup Guide

A web Freecell game built with Phasor.

## Prerequisites

- Node.js

## Installation Steps

1. **Install Project Dependencies**

   Navigate to your project directory and install the necessary dependencies:

   ```bash
   npm install
   ```

1. **Run the Development Server**

   Start the development server to see your project in action:

   ```bash
   npm run dev
   ```

1. **View Your Project**

   Open your browser and open:

   [http://localhost:3000](http://localhost:3000)

## Development Guide

### Running the Linter

To ensure code consistency and catch potential issues, run the linter:

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

Make sure to fix any remaining issues manually if they cannot be auto-fixed.

### Deployment

To deploy the game as a static website:

1. Build the project:

```bash
npm run build
```

This will generate an `/out` folder containing your static site.

1. Upload the contents of the `/out` folder to your hosting platform.
Ensure that `index.html` is located at the root of your hosted directory.