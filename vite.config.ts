import path from "path";
import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [solid({ ssr: false })],
    resolve: {
      alias: {
        rpc: path.join(__dirname, "src", "server", "api"),
      },
    },
  };
});
