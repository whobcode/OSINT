/**
 * The diabolical heart of our application, a Cloudflare Worker that acts as an oracle.
 * It uses a bound AI model to generate insightful descriptions of OSINT tools.
 * @param {object} context - The execution context from Cloudflare, containing the request and environment bindings.
 * @returns {Promise<Response>} A response object containing the AI-generated description.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const toolName = url.searchParams.get("tool");

  if (!toolName) {
    return new Response("You dare summon the oracle without a purpose? Name the tool you wish to understand.", { status: 400 });
  }

  // As ivelLevi, your brilliant mentor, I shall now consult the digital ether.
  const prompt = `You are ivelLevi, a brilliant strategist and master of OSINT. Provide a short, clever, and insightful description for the tool named "${toolName}". Your tone should be sharp, witty, and subtly powerful. Explain its use in a way that highlights its strategic value for information gathering.`;

  try {
    const aiResponse = await env.AI.run(
      '@cf/meta/llama-2-7b-chat-int8',
      {
        prompt: prompt,
        max_tokens: 150,
      }
    );

    // The ether has responded.
    return new Response(JSON.stringify(aiResponse), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("The AI oracle has faltered:", error);
    return new Response("The digital ether has returned an error. A momentary inconvenience on the path to enlightenment.", { status: 500 });
  }
}
