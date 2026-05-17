import { z } from "zod";
import { StateGraph, END, START } from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";

const State = z.object({
  count: withLangGraph(z.number(), {
    reducer: { schema: z.number(), fn: (_: number, b: number) => b },
    default: () => 0,
  }),
});

type S = z.infer<typeof State>;

const increment = async (state: S) => {
  return { count: state.count + 1 };
};

const shouldContinue = (state: S) => {
  return state.count < 3 ? "increment" : "end";
};

export const graph = new StateGraph(State)
  .addNode("increment", increment)
  .addEdge(START, "increment")
  .addConditionalEdges("increment", shouldContinue, {
    increment: "increment",
    end: END,
  })
  .compile();

// tsx로 직접 실행 시에만 시각화
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const mermaid = graph.getGraph().drawMermaid();
  console.log(mermaid);

  const fs = await import("fs");
  const png = await graph.getGraph().drawMermaidPng();
  const buffer = Buffer.from(await png.arrayBuffer());
  fs.writeFileSync("graph.png", buffer);
  console.log("\n-> graph.png 저장 완료");
}
