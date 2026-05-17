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
  console.log(`count: ${state.count} -> ${state.count + 1}`);
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
