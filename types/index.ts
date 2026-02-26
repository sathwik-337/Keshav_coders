export type Message = {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};
