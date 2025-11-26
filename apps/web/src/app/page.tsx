"use client";

import { useState } from "react";
import { Send, Loader2, Users, Brain, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<{
    finalResponse: string;
    chairmanModel: string;
    totalLatencyMs: number;
    workerCount: number;
    aggregatedCritiques: Array<{
      responseId: string;
      providerId: string;
      modelId: string;
      averageRank: number;
      averageScore: number;
      votes: number;
    }>;
  } | null>(null);

  const councilMutation = trpc.council.query.useMutation({
    onSuccess: (data) => {
      setResponse(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    councilMutation.mutate({
      prompt: prompt.trim(),
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">LLM Council</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Multi-Model AI Router
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!response && !councilMutation.isPending && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Ask the Council
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Your question is sent to multiple AI models simultaneously. They generate
              independent responses, critique each other anonymously, and a chairman
              synthesizes the best answer.
            </p>

            {/* Pipeline Visualization */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm mt-2">Fan-Out</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <span className="text-sm mt-2">Generate</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-error rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm mt-2">Critique</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-secondary-foreground rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm mt-2">Synthesize</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {councilMutation.isPending && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Council in Session</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Multiple models are generating, critiquing, and synthesizing...
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-200 rounded-full" />
                <span className="text-xs mt-1">GPT</span>
              </div>
              <div className="animate-pulse flex flex-col items-center" style={{ animationDelay: "0.1s" }}>
                <div className="w-8 h-8 bg-orange-200 rounded-full" />
                <span className="text-xs mt-1">Claude</span>
              </div>
              <div className="animate-pulse flex flex-col items-center" style={{ animationDelay: "0.2s" }}>
                <div className="w-8 h-8 bg-green-200 rounded-full" />
                <span className="text-xs mt-1">Gemini</span>
              </div>
              <div className="animate-pulse flex flex-col items-center" style={{ animationDelay: "0.3s" }}>
                <div className="w-8 h-8 bg-purple-200 rounded-full" />
                <span className="text-xs mt-1">Grok</span>
              </div>
            </div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="space-y-6">
            {/* Final Response */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="font-semibold">Synthesized Response</h3>
                <span className="text-sm text-gray-500 ml-auto">
                  {response.workerCount} models • {Math.round(response.totalLatencyMs)}ms
                </span>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{response.finalResponse}</p>
              </div>
            </div>

            {/* Critique Summary */}
            {response.aggregatedCritiques.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="font-semibold mb-4">Model Rankings</h3>
                <div className="space-y-3">
                  {response.aggregatedCritiques
                    .sort((a, b) => a.averageRank - b.averageRank)
                    .map((critique) => (
                      <div
                        key={critique.responseId}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{critique.providerId}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {critique.modelId}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Rank: #{critique.averageRank.toFixed(1)}</span>
                          <span>Score: {critique.averageScore.toFixed(0)}</span>
                          <span className="text-success">{critique.votes} votes</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* New Query Button */}
            <button
              onClick={() => {
                setResponse(null);
                setPrompt("");
              }}
              className="w-full py-3 text-primary border border-primary rounded-lg hover:bg-primary/5 transition"
            >
              Ask Another Question
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the council anything..."
              className="w-full p-4 pr-14 border rounded-lg resize-none bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              disabled={councilMutation.isPending}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || councilMutation.isPending}
              className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Error State */}
        {councilMutation.isError && (
          <div className="mt-4 p-4 bg-error/10 border border-error rounded-lg text-error">
            <p>Error: {councilMutation.error?.message || "Something went wrong"}</p>
          </div>
        )}
      </div>
    </main>
  );
}
