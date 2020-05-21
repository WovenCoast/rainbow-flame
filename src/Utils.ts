import childProcess from "child_process";

export function randomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}
export function convertMs(ms: number): string {
  const showWith0 = (value) => (value < 10 ? `0${value}` : value);
  const days = showWith0(Math.floor((ms / (1000 * 60 * 60 * 24)) % 60));
  const hours = showWith0(Math.floor((ms / (1000 * 60 * 60)) % 24));
  const minutes = showWith0(Math.floor((ms / (1000 * 60)) % 60));
  const seconds = showWith0(Math.floor((ms / 1000) % 60));
  if (parseInt(days)) return `${days}d`;
  if (parseInt(hours)) return `${hours}h`;
  if (parseInt(minutes)) return `${minutes}min`;
  if (parseInt(seconds)) return `${seconds}s`;
  if (Math.floor(ms)) return `${ms}ms`;
  return ms + "ms";
}
export function convertBytes(bytes: number): string {
  const decimals = 2;
  if (bytes == 0) return "0 Bytes";
  var k = 1024,
    dm = decimals <= 0 ? 0 : decimals || 2,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
export function convertDuration(duration: number): string {
  const showWith0 = (value) => (value < 10 ? `0${value}` : value);
  const seconds = showWith0(Math.floor(duration % 60));
  const minutes = showWith0(Math.floor(duration / 60) % 60);
  const hours = showWith0(Math.floor((duration / 60 / 60) % 24));
  const days = showWith0(Math.floor(duration / 60 / 60 / 24));
  return `${days !== "00" ? days + ":" : ""}${
    hours !== "00" ? hours + ":" : ""
  }${minutes}:${seconds}`;
}
export function getRandom(arr: any[]): any {
  return arr[randomValue(0, arr.length)];
}
export function titleCase(string: string): string {
  return string
    .split(" ")
    .map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}
export function pluralify(
  amount: number,
  string: string,
  returnAmount: boolean = true
): string {
  if (amount === 1) return (returnAmount ? amount + " " : "") + string;
  else return (returnAmount ? amount + " " : "") + string + "s";
}
export function sanitize(string: string): string {
  return string.replace(
    new RegExp(
      `${Object.keys(process.env)
        .filter((e) => ["TOKEN", "SECRET"].some((s) => e.endsWith(s)))
        .map((k) => process.env[k])
        .join("|")}`,
      "gi"
    ),
    "nu cyka blyat"
  );
}
export function delay(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
export function exec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });
}
export function shuffle<K extends any>(array: Array<K>): Array<K> {
  const tempArray = Object.assign([], array);
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = tempArray[currentIndex];
    tempArray[currentIndex] = tempArray[randomIndex];
    tempArray[randomIndex] = temporaryValue;
  }

  return tempArray;
}

export function chunk(length: number, string: string): Array<string> {
  return string.match(new RegExp(`(.|[\\r\\n]){1,${length}}`, "g"));
}
