import { generateId } from "ai";
import { existsSync, mkdirSync } from "fs";
import { readdir, readFile, writeFile, stat } from "fs/promises";
import path from "path";
import { ChatMessage } from "./types";

const chatDir = path.join(process.cwd(), ".chats");

export function getChatFile(id: string): string {
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
  return path.join(chatDir, `${id}.json`);
}

export async function createChat(): Promise<string> {
  const id = generateId(); // generate a unique chat ID
  await writeFile(getChatFile(id), "[]"); // create an empty chat file
  return id;
}

export async function loadChat(id: string): Promise<ChatMessage[]> {
  return JSON.parse(await readFile(getChatFile(id), "utf8"));
}

export async function saveChat({
  id,
  messages,
}: {
  id: string;
  messages: ChatMessage[];
}): Promise<void> {
  const content = JSON.stringify(messages, null, 2);
  await writeFile(getChatFile(id), content);
}

export async function getLatestChat() {
  const chatFiles = await readdir(chatDir);
  const jsonFiles = chatFiles.filter((file) => path.extname(file) === ".json");

  if (jsonFiles.length === 0) {
    // Create a new chat if no JSON files exist
    const newChatId = await createChat();
    return { chatId: newChatId, messages: await loadChat(newChatId) };
  }

  // Get file stats for each JSON file to determine the latest one
  const filesWithStats = await Promise.all(
    jsonFiles.map(async (file) => {
      const filePath = path.join(chatDir, file);
      const stats = await stat(filePath);
      return {
        name: path.parse(file).name,
        birthtime: stats.birthtime,
      };
    })
  );

  // Sort by creation time (newest first) and get the latest file
  const latestFile = filesWithStats.sort(
    (a, b) => b.birthtime.getTime() - a.birthtime.getTime()
  )[0];

  return { chatId: latestFile.name, messages: await loadChat(latestFile.name) };
}
