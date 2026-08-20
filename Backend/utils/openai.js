import "dotenv/config";

const getOpenAIAPIResponse = async (messages) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenAI request failed");
    }

    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const generateChatTitle = async (message) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 20,
      messages: [
        {
          role: "system",
          content:
            "You only write short chat titles. Return 2 to 5 words only. Do not answer the user's request. Do not include code, markdown, quotes, punctuation, or explanations.",
        },
        {
          role: "user",
          content: `Create a short title for this chat request: ${message}`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to generate title");
  }

  let title = data.choices?.[0]?.message?.content?.trim();

  if (
    !title ||
    title.length > 60 ||
    title.includes("```") ||
    title.includes("\n") ||
    title.split(/\s+/).length > 6
  ) {
    title = message.substring(0, 40);
  }

  return title;
};

export default getOpenAIAPIResponse;
