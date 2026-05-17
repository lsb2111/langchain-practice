# LangChain & LangGraph Practice

LangChain JS / LangGraph JS를 학습하고 실험하기 위한 레포.
학습 진행자는 랭채인의 초보자로 설명요구시 초보자도 이해할수 있게 설명.
코드 생성시 불필요한 코드 생성과 추상화는 하지말고 간결함을 중시.
코드 작성 시 각 부분에 한글 주석으로 설명을 추가하여 학습에 도움이 되도록 할 것.

## Stack

- TypeScript + tsx (ESM)
- langchain, @langchain/core, @langchain/google-genai, @langchain/openai, @langchain/anthropic
- @langchain/langgraph
- LLM 모델은 Gemini(`ChatGoogleGenerativeAI`)를 사용: 빠른 응답은 `gemini-2.5-flash`, 고품질 추론은 `gemini-3.1-pro-preview`

## Structure

- `src/langchain/` — LangChain 예제 (번호순)
- `src/langgraph/` — LangGraph 예제 (번호순)

## Run

```bash
npx tsx src/langchain/01-chat-model.ts   # 개별 예제 실행
npx tsx src/langgraph/01-simple-graph.ts
```

## Studio

`src/langgraph/`에 그래프를 새로 만들면 `langgraph.json`의 `graphs`에 항목을 추가할 것.

- 형식: `"이름": "./dist/langgraph/파일명.js:export이름"`
- state는 Zod + `withLangGraph`로 정의 (런타임 스키마 추출을 위해)
- `export const graph = ...compile()` 필수
- 실행: `npm run studio`

**주의:** JS/TS에서 LangGraph Studio 호환성이 불완전함.
- `Annotation` 기반 state는 컴파일 후 타입 정보가 사라져 Studio 스키마 추출 실패
- 반드시 Zod 기반(`MessagesZodState`, `withLangGraph`) 사용
- 메시지 state는 `MessagesAnnotation` 대신 `MessagesZodState` 사용

## Keys

`.env`에 API 키 설정 (`.env.example` 참고).
