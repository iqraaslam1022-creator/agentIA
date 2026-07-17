// supabase/functions/invoke-llm/index.ts
// General-purpose AI assistant endpoint for AgentIA, powered by Groq (OpenAI-compatible API).
// Frontend calls this with: { task: "follow_up" | "property_description" | "lead_summary" | "custom", context: {...} }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(task: string, context: Record<string, unknown>): string {
    switch (task) {
        case "follow_up":
            return `You are a helpful real estate CRM assistant. Write a short, warm, professional follow-up message (WhatsApp/SMS style, max 60 words) for this lead:
Name: ${context.name ?? "N/A"}
Property interest: ${context.property_interest ?? "N/A"}
Preferred location: ${context.preferred_location ?? "N/A"}
Budget: ${context.budget_min ?? "?"} - ${context.budget_max ?? "?"}
Current status: ${context.status ?? "N/A"}
Notes: ${context.notes ?? "None"}
Only output the message text, nothing else.`;

        case "property_description":
            return `You are a real estate copywriter. Write an attractive, concise property listing description (max 80 words) for:
Title: ${context.title ?? "N/A"}
Type: ${context.type ?? "N/A"}
Price: ${context.price ?? "N/A"}
Location: ${context.location ?? "N/A"}
Size: ${context.size ?? "N/A"}
Bedrooms: ${context.bedrooms ?? "N/A"}
Bathrooms: ${context.bathrooms ?? "N/A"}
Only output the description text, nothing else.`;

        case "lead_summary":
            return `You are a real estate CRM assistant. Summarize this lead in 2-3 short sentences, highlighting urgency and next best action:
Name: ${context.name ?? "N/A"}
Source: ${context.lead_source ?? "N/A"}
Property interest: ${context.property_interest ?? "N/A"}
Budget: ${context.budget_min ?? "?"} - ${context.budget_max ?? "?"}
Status: ${context.status ?? "N/A"}
Notes: ${context.notes ?? "None"}
Only output the summary text, nothing else.`;

        case "custom":
        default:
            return String(context.prompt ?? "");
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Missing authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Verify the caller is a logged-in user of this app
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } }
        );
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !userData?.user) {
            return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { task, context } = await req.json();
        const prompt = buildPrompt(task, context ?? {});

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Empty prompt" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const groqApiKey = Deno.env.get("GROQ_API_KEY");
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${groqApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 300,
            }),
        });

        const groqData = await groqResponse.json();

        if (!groqResponse.ok) {
            console.error("Groq error:", JSON.stringify(groqData));
            return new Response(JSON.stringify({ error: "AI request failed", details: groqData }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const text = groqData?.choices?.[0]?.message?.content?.trim() ?? "";

        return new Response(JSON.stringify({ text }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("invoke-llm error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
