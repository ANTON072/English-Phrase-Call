import "dotenv/config";
import { Client } from "@notionhq/client";
import { parseNotionResults, pickRandom } from "./notion.js";
import * as readline from "node:readline";

const NOTION_API_KEY = process.env["NOTION_API_KEY"] ?? "";
const NOTION_DATABASE_ID = process.env["NOTION_DATABASE_ID"] ?? "";

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
  console.error("環境変数 NOTION_API_KEY と NOTION_DATABASE_ID を設定してください。");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

async function fetchAllPhrases() {
  const results: unknown[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    results.push(...response.results);
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return parseNotionResults(results);
}

function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("", () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  console.log("📚 英単語帳クイズ — Ctrl+C で終了\n");
  console.log("Notionからデータを取得中...");

  const phrases = await fetchAllPhrases();

  if (phrases.length === 0) {
    console.error("単語が見つかりませんでした。");
    process.exit(1);
  }

  console.log(`${phrases.length}件の単語を取得しました。\n`);

  while (true) {
    const phrase = pickRandom(phrases);

    // 英語を表示
    const posLabel = phrase.partOfSpeech.length > 0 ? ` (${phrase.partOfSpeech.join(", ")})` : "";
    console.log(`📝 ${phrase.word}${posLabel}`);
    if (phrase.example) {
      console.log(`   ${phrase.example}`);
    }

    await waitForEnter();

    // 日本語を表示
    console.log(`👉 ${phrase.meaning}`);
    if (phrase.exampleTranslation) {
      console.log(`   ${phrase.exampleTranslation}`);
    }

    console.log("---");
    await waitForEnter();
  }
}

main().catch((err) => {
  console.error("エラーが発生しました:", err);
  process.exit(1);
});
