import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import path from "path"

export default [
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.js", format: "es", sourcemap: true },
      { file: "dist/index.cjs", format: "cjs", sourcemap: true, exports: "named" }
    ],
    external: id => !id.startsWith(".") && !id.startsWith("/") && !path.isAbsolute(id),
    plugins: [
      nodeResolve(),
      typescript({ declaration: true, declarationDir: "dist", rootDir: "src" })
    ]
  }
]
