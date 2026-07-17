import React, { useState } from "react";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/api/supabaseClient";

/**
 * Reusable AI Assistant trigger + result panel.
 *
 * Usage:
 * <AIAssistantButton task="follow_up" context={leadObject} label="Write Follow-up" />
 * <AIAssistantButton task="property_description" context={propertyObject} label="Generate Description" />
 * <AIAssistantButton task="lead_summary" context={leadObject} label="Summarize Lead" />
 *
 * onResult (optional): callback(text) — e.g. to auto-fill a form field instead of just showing text
 */
export default function AIAssistantButton({ task, context, label = "Ask AI", onResult }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        setError("");
        setResult("");
        try {
            const { data, error: fnError } = await supabase.functions.invoke("invoke-llm", {
                body: { task, context },
            });

            if (fnError) throw new Error(fnError.message || "AI request failed");
            if (data?.error) throw new Error(data.error);

            const text = data?.text ?? "";
            setResult(text);
            if (onResult) onResult(text);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="w-full">
            <Button
                type="button"
                variant="outline"
                onClick={handleClick}
                disabled={loading}
                className="gap-2 border-[#C9A227]/40 text-[#1C1C1C] hover:bg-[#C9A227]/10"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#C9A227]" />}
                {loading ? "Thinking…" : label}
            </Button>

            {error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-2 text-sm bg-[#F8F6F1] border border-gray-200 rounded-lg p-3 relative">
                    <p className="pr-6 whitespace-pre-wrap text-[#1C1C1C]">{result}</p>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="absolute top-2 right-2 text-gray-400 hover:text-[#C9A227]"
                        title="Copy"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </div>
    );
}
