// .env 파일에서 API 키(GOOGLE_API_KEY 등)를 자동으로 환경변수에 로드
import "dotenv/config";
import {
  StateGraph, // 그래프를 정의하는 클래스
  START, // 그래프 시작 지점
  END, // 그래프 종료 지점
  MessagesZodState, // { messages: BaseMessage[] } 형태의 Zod 기반 state 스키마
  MemorySaver, // 대화 히스토리를 메모리에 저장하는 체크포인터
} from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage } from "@langchain/core/messages";
import * as readline from "readline";

// ========== 1. LLM 모델 설정 ==========
const model = new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash" });

// ========== 2. 노드 정의 ==========
// 노드 = 그래프에서 실행되는 하나의 작업 단위
// state에서 messages를 받아 LLM에 보내고, 응답을 다시 messages에 추가
const callModel = async (state: { messages: BaseMessage[] }) => {
  const response = await model.invoke(state.messages);
  // { messages: [...] } 형태로 반환하면 기존 messages 배열에 자동 append됨
  return { messages: [response] };
};

// ========== 3. 그래프 구성 ==========
// StateGraph: state를 관리하면서 노드들을 순서대로 실행하는 그래프
// MessagesZodState: messages 배열을 state로 사용 (Zod 기반이라 Studio 호환)
export const graph = new StateGraph(MessagesZodState)
  .addNode("chat", callModel) // "chat"이라는 이름으로 노드 등록
  .addEdge(START, "chat") // 시작 → chat 노드로 연결
  .addEdge("chat", END) // chat 노드 → 종료로 연결
  .compile({
    // MemorySaver: thread_id별로 대화 히스토리를 메모리에 보관
    // 같은 thread_id로 invoke하면 이전 대화를 기억한 상태로 응답
    checkpointer: new MemorySaver(),
  });

// ========== 4. 실행 ==========
// thread_id로 대화 세션을 구분 (다른 thread_id = 다른 대화)
const config = { configurable: { thread_id: "session-1" } };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("챗봇 시작 (종료: exit)\n");

// 사용자 입력 → graph.invoke → AI 응답 → 반복
const ask = () => {
  rl.question("You: ", async (input) => {
    if (input.trim() === "exit") {
      rl.close();
      return;
    }
    // graph.invoke: 그래프를 한 번 실행
    // messages에 유저 메시지를 넣으면, 체크포인터가 이전 대화를 자동으로 불러옴
    const result = await graph.invoke(
      { messages: [{ role: "user", content: input }] },
      config,
    );
    // 마지막 메시지 = AI의 응답
    const last = result.messages[result.messages.length - 1];
    console.log(`AI: ${last.content}\n`);
    ask();
  });
};

ask();
