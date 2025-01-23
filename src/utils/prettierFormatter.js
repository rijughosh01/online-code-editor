import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";

export const formatCode = (code) => {
  return prettier.format(code, {
    parser: "babel",
    plugins: [parserBabel],
  });
};
