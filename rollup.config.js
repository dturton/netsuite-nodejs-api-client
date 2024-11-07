// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.ts", // Entry point of your application
  output: {
    file: "dist/index.js", // Output file
    format: "cjs", // CommonJS format for Node.js
    sourcemap: true, // Include source map for debugging
  },
  plugins: [
    resolve(), // Resolve Node.js modules
    commonjs(), // Convert CommonJS modules to ES6
    typescript(), // Compile TypeScript
  ],
  external: ["axios", "dotenv"], // Mark axios and dotenv as external dependencies
};
