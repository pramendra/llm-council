"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Users,
  Brain,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Award,
  Zap,
  RefreshCw,
  ArrowRight,
  Clock,
  BarChart3,
  Shield,
  Crown,
  GitBranch,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Provider colors and icons
const providerConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  openai: { color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", icon: "GPT" },
  google: { color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: "GEM" },
  anthropic: { color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", icon: "CLD" },
  grok: { color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30", icon: "GRK" },
};

// Pipeline phases for visualization
const phases = [
  { id: 1, name: "Fan-Out", icon: GitBranch, description: "Send to models" },
  { id: 2, name: "Generate", icon: Brain, description: "Independent responses" },
  { id: 3, name: "Anonymize", icon: Shield, description: "Remove identities" },
  { id: 4, name: "Critique", icon: MessageSquare, description: "Cross-evaluation" },
  { id: 5, name: "Synthesize", icon: Crown, description: "Chairman merges" },
];

interface CouncilResponse {
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
}

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<CouncilResponse | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);

  const councilMutation = trpc.council.query.useMutation({
    onSuccess: (data) => {
      setResponse(data);
      setCurrentPhase(5);
    },
    onError: () => {
      setCurrentPhase(0);
    },
  });

  // Simulate phase progression during loading
  useEffect(() => {
    if (councilMutation.isPending) {
      const interval = setInterval(() => {
        setCurrentPhase((prev) => (prev < 4 ? prev + 1 : prev));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [councilMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setCurrentPhase(1);
    councilMutation.mutate({ prompt: prompt.trim() });
  };

  const handleReset = () => {
    setResponse(null);
    setPrompt("");
    setCurrentPhase(0);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 glass">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">LLM Council</h1>
                  <p className="text-xs text-muted-foreground">Multi-Model AI Router</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" className="hidden sm:flex">
                  <Zap className="w-3 h-3 mr-1" />
                  Ensemble AI
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Hero Section - Show when no response */}
          <AnimatePresence mode="wait">
            {!response && !councilMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                >
                  <Sparkles className="w-4 h-4" />
                  Powered by Karpathy's Ensemble Method
                </motion.div>
                
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                  <span className="gradient-text">Ask the Council</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                  Your question is sent to multiple AI models. They generate independent responses,
                  critique each other anonymously, and a chairman synthesizes the best answer.
                </p>

                {/* Pipeline Visualization */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 flex-wrap">
                  {phases.map((phase, index) => (
                    <div key={phase.id} className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center group cursor-default">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <phase.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium mt-2 text-muted-foreground">{phase.name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{phase.description}</p>
                        </TooltipContent>
                      </Tooltip>
                      {index < phases.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground/50 mx-1 sm:mx-2 hidden sm:block" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    { icon: Shield, title: "Anonymity", desc: "Unbiased evaluation" },
                    { icon: BarChart3, title: "Rankings", desc: "Per-query scoring" },
                    { icon: Award, title: "Synthesis", desc: "Best of all models" },
                  ].map((feature) => (
                    <Card key={feature.title} className="border-dashed hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6 text-center">
                        <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence mode="wait">
            {councilMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12"
              >
                <Card className="max-w-2xl mx-auto overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                      <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">Council in Session</CardTitle>
                    <CardDescription>
                      Multiple models deliberating your question...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Phase Progress */}
                    <div className="space-y-4">
                      {phases.map((phase, index) => (
                        <motion.div
                          key={phase.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                              currentPhase > index
                                ? "bg-success text-white"
                                : currentPhase === index
                                ? "bg-primary text-white animate-pulse"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {currentPhase > index ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <phase.icon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "font-medium",
                                currentPhase >= index ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {phase.name}
                              </span>
                              {currentPhase === index && (
                                <Badge variant="info" className="animate-pulse">In Progress</Badge>
                              )}
                              {currentPhase > index && (
                                <Badge variant="success">Complete</Badge>
                              )}
                            </div>
                            <Progress
                              value={currentPhase > index ? 100 : currentPhase === index ? 50 : 0}
                              className="mt-2 h-1.5"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Model Avatars */}
                    <Separator />
                    <div className="flex justify-center gap-4">
                      {Object.entries(providerConfig).slice(0, 3).map(([id, config], index) => (
                        <motion.div
                          key={id}
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.3,
                          }}
                          className="flex flex-col items-center gap-1"
                        >
                          <Avatar className={cn("w-12 h-12 border-2", config.bgColor)}>
                            <AvatarFallback className={config.color}>{config.icon}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground capitalize">{id}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Response Display */}
          <AnimatePresence mode="wait">
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Main Response Card */}
                <Card className="overflow-hidden border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Synthesized Response</CardTitle>
                          <CardDescription>
                            Council verdict from {response.workerCount} model{response.workerCount > 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="hidden sm:flex">
                          <Clock className="w-3 h-3 mr-1" />
                          {(response.totalLatencyMs / 1000).toFixed(1)}s
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {response.finalResponse}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Critiques Tab */}
                {response.aggregatedCritiques.length > 0 && (
                  <Card>
                    <Tabs defaultValue="rankings" className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Council Insights</CardTitle>
                          <TabsList>
                            <TabsTrigger value="rankings">
                              <Award className="w-4 h-4 mr-2" />
                              Rankings
                            </TabsTrigger>
                            <TabsTrigger value="details">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Details
                            </TabsTrigger>
                          </TabsList>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <TabsContent value="rankings" className="mt-0">
                          <div className="space-y-3">
                            {response.aggregatedCritiques
                              .sort((a, b) => a.averageRank - b.averageRank)
                              .map((critique, index) => {
                                const config = providerConfig[critique.providerId] || providerConfig.openai;
                                return (
                                  <motion.div
                                    key={critique.responseId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="relative">
                                        {index === 0 && (
                                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                            <Crown className="w-3 h-3 text-yellow-900" />
                                          </div>
                                        )}
                                        <Avatar className={cn("w-10 h-10", config.bgColor)}>
                                          <AvatarFallback className={config.color}>{config.icon}</AvatarFallback>
                                        </Avatar>
                                      </div>
                                      <div>
                                        <p className="font-medium capitalize">{critique.providerId}</p>
                                        <p className="text-sm text-muted-foreground">{critique.modelId}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                      <div className="text-center">
                                        <p className="text-muted-foreground">Rank</p>
                                        <p className="font-bold text-lg">#{critique.averageRank.toFixed(1)}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">Score</p>
                                        <p className="font-bold text-lg">{critique.averageScore.toFixed(0)}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-muted-foreground">Votes</p>
                                        <Badge variant="success">{critique.votes}</Badge>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                          </div>
                        </TabsContent>
                        <TabsContent value="details" className="mt-0">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {response.aggregatedCritiques.map((critique) => {
                              const config = providerConfig[critique.providerId] || providerConfig.openai;
                              const scorePercent = critique.averageScore;
                              return (
                                <Card key={critique.responseId} className="border-dashed">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center gap-3 mb-4">
                                      <Avatar className={cn("w-8 h-8", config.bgColor)}>
                                        <AvatarFallback className={cn("text-xs", config.color)}>{config.icon}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium capitalize">{critique.providerId}</p>
                                        <p className="text-xs text-muted-foreground">{critique.modelId}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Score</span>
                                        <span className="font-medium">{critique.averageScore.toFixed(0)}/100</span>
                                      </div>
                                      <Progress value={scorePercent} className="h-2" />
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </TabsContent>
                      </CardContent>
                    </Tabs>
                  </Card>
                )}

                {/* New Query Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Ask Another Question
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Form */}
          <motion.div
            layout
            className={cn(
              "sticky bottom-4 z-40",
              response && "max-w-2xl mx-auto"
            )}
          >
            <Card className="shadow-2xl shadow-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask the council anything... (e.g., 'Explain quantum computing in simple terms')"
                    className="min-h-[100px] text-base resize-none"
                    disabled={councilMutation.isPending}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {prompt.length > 0 && `${prompt.length} characters`}
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!prompt.trim() || councilMutation.isPending}
                      className="gap-2 min-w-[140px]"
                    >
                      {councilMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Ask Council
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error State */}
          <AnimatePresence>
            {councilMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-destructive">Council Error</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {councilMutation.error?.message || "Something went wrong. Please try again."}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => councilMutation.reset()}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                LLM Council — Ensemble AI routing inspired by Karpathy
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline">MIT License</Badge>
                <a
                  href="https://github.com/pramendra/llm-council"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
