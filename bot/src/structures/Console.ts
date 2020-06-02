import { yellow, red, blue, green, hex } from "chalk";
import { inspect } from "util";
import { Console } from "console";
import { colors } from "../Config";
import { shuffle } from "../Utils";

function rainbowColor(arg: string): string {
  const rainbowColors = shuffle(colors.scheme);
  let currentColor = -1;
  return arg
    .split("")
    .map((s: string) => {
      currentColor++;
      if (currentColor === rainbowColors.length) currentColor = 0;
      return hex(rainbowColors[currentColor])(s);
    })
    .join("");
}

export class FlameConsole extends Console {
  get timestamp(): string {
    return new Date(Date.now()).toLocaleTimeString();
  }
  output(color: Function, type: string, ...args: any[]) {
    return process.stdout.write(
      args
        .map((arg: any) => (typeof arg === "string" ? arg : inspect(arg)))
        .join("\n")
        .split("\n")
        .filter((s: string) => s.trim() !== "")
        .map(
          (s: string) =>
            `[ ${color(this.timestamp)} ]${color("-")}( ${color(
              type.toUpperCase()
            )} ) ${color(s)}`
        )
        .join("\n") + "\n"
    );
  }
  rainbow(type, ...args: any[]) {
    this.output(rainbowColor, type, ...args);
  }
  log(...args: any[]) {
    this.output(blue, "log", ...args);
  }
  error(...args: any[]) {
    this.output(red, "error", ...args);
  }
  warn(...args: any[]) {
    this.output(yellow, "warn", ...args);
  }
  debug(...args: any[]) {
    this.output(green, "debug", ...args);
  }
}
