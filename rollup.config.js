import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"
import { typescriptPaths } from "rollup-plugin-typescript-paths"
import { dependencies } from "./package.json"

const external = ["rxjs/operators", ...Array.from(Object.keys(dependencies))]

export default [
  {
    input: "src/index.ts",
    output: { format: "cjs", file: "dist/gate.js", sourcemap: true },
    plugins: [typescript()],
    external,
  },
  {
    input: "src/index.ts",
    output: { format: "esm", file: "dist/gate.esm.js", sourcemap: true },
    plugins: [typescript()],
    external,
  },
  {
    input: "src/index.ts",
    output: { format: "esm", file: "dist/gate.d.ts", sourcemap: true },
    plugins: [typescriptPaths({
      transform: (path) => path.replace(/\.js$/, '.ts'),
    }),dts()],
  },
]
