import "dotenv/config";
import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import * as readline from "readline";

const model = new ChatOpenAI({ model: "gpt-4o-mini" });

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};

const graph = new StateGraph(MessagesAnnotation)
  .addNode("chat", callModel)
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "session-1" } };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("챗봇 시작 (종료: exit)\n");

const ask = () => {
  rl.question("You: ", async (input) => {
    if (input.trim() === "exit") {
      rl.close();
      return;
    }
    const result = await graph.invoke(
      { messages: [{ role: "user", content: input }] },
      config,
    );
    const last = result.messages[result.messages.length - 1];
    console.log(`AI: ${last.content}\n`);
    ask();
  });
};

ask();
