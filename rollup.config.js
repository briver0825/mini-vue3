import pkg from "./package.json"
import typescript from "@rollup/plugin-typescript"
import resolve from "@rollup/plugin-node-resolve"

export default {
  input: "./packages/index.ts",
  output: [
    {
      format: "cjs",
      file: pkg.main,
    },
    ,
    {
      format: "es",
      file: pkg.module,
    },
  ],
  plugins: [typescript(), resolve],
}
