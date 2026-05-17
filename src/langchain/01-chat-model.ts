import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash" });
const response = await model.invoke("Hello, what is LangChain?");

console.log(response.content);
