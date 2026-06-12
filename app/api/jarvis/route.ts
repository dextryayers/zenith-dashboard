import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const searchJinaWebFunction: FunctionDeclaration = {
  name: "searchWebJina",
  parameters: {
    type: Type.OBJECT,
    description: "Search the web for news or information using Jina AI search.",
    properties: {
      query: {
        type: Type.STRING,
        description: "The search query to look up on the web.",
      },
    },
    required: ["query"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, history = [] } = await req.json();

    const systemInstruction = 
      "You are Jarvis, a highly capable AI assistant to the user ('Boss'). " +
      "Address the user as 'Boss'. " +
      "Always communicate strictly in English only. " +
      "If the user asks for news, information, or searches, use the searchWebJina tool to fetch the latest context online. " +
      "Provide concise, professional, and confident responses typical of an advanced AI system. Keep your answers brief since they will be read aloud by a text-to-speech engine.";

    let contents = [
      ...history,
      { role: "user", parts: [{ text: prompt }] }
    ];

    let currentResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [searchJinaWebFunction] }],
      },
    });

    let functionCalls = currentResponse.functionCalls;

    // Handle potential function call
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "searchWebJina") {
        const query = (call.args as any).query;
        let searchResult = "";
        try {
          const fetchRes = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`);
          if (fetchRes.ok) {
             const text = await fetchRes.text();
             // limit to 5000 chars to avoid prompt blast
             searchResult = text.substring(0, 5000) + "...(truncated)";
          } else {
             searchResult = "Error retrieving search results from Jina AI.";
          }
        } catch (e) {
          searchResult = "Network error during Jina AI search.";
        }
        
        // Append model's previous response to conversation contents
        if (currentResponse.candidates && currentResponse.candidates.length > 0) {
          contents.push(currentResponse.candidates[0].content);
        }

        // Add the function response
        contents.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: "searchWebJina",
              response: { result: searchResult }
            }
          }]
        });

        // Get final answer
        currentResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
             systemInstruction,
             tools: [{ functionDeclarations: [searchJinaWebFunction] }]
          }
        });
      }
    }

    return NextResponse.json({ 
      text: currentResponse.text,
      history: [
        ...contents,
        ...(currentResponse.candidates && currentResponse.candidates.length > 0 
              ? [currentResponse.candidates[0].content]
              : [])
      ]
    });

  } catch (error: any) {
    console.error("Jarvis API Error:", error);
    return NextResponse.json({ text: "I encountered a systems error, Boss." }, { status: 500 });
  }
}
