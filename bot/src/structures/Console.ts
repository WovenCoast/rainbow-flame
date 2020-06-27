import { yellow, red, blue, green, cyan } from "colors";
import { hex } from "chalk";
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
            `[ ${cyan(this.timestamp)} ]${color("-")}( ${green(
              type.toUpperCase()
            )} ) ${color(s)}`
        )
        .join("\n") + "\n"
    );
  }
  rainbow(source: string, ...args: any[]) {
    this.output(rainbowColor, source, ...args);
  }
  log(source: string, arg: string, properties: Object = {}) {
    this.output(
      blue,
      source,
      arg.replace(
        new RegExp(`{(${Object.keys(properties).join("|")})}`, "g"),
        (match, property) => cyan(properties[property] || "")
      )
    );
  }
  error(source: string, ...args: any[]) {
    this.output(red, source, ...args);
  }
  warn(source: string, ...args: any[]) {
    this.output(yellow, source, ...args);
  }
  debug(...args: any[]) {
    this.output(green, "debug", ...args);
  }
}
