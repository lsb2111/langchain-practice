import { StateGraph, Annotation, END, START } from "@langchain/langgraph";

const State = Annotation.Root({
  count: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),
});

const increment = async (state: typeof State.State) => {
  console.log(`count: ${state.count} -> ${state.count + 1}`);
  return { count: state.count + 1 };
};

const shouldContinue = (state: typeof State.State) => {
  return state.count < 3 ? "increment" : "end";
};

const graph = new StateGraph(State)
  .addNode("increment", increment)
  .addEdge(START, "increment")
  .addConditionalEdges("increment", shouldContinue, {
    increment: "increment",
    end: END,
  })
  .compile();

const result = await graph.invoke({ count: 0 });
console.log("final:", result);
