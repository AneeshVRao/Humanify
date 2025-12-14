"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check, ArrowRight } from "lucide-react";

const LiveDemo = () => {
  const [inputText, setInputText] = useState(
    "Artificial intelligence has revolutionized the way we approach content creation. The utilization of AI-powered tools enables efficient generation of written material. Furthermore, these technological advancements facilitate enhanced productivity in various domains."
  );
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const humanizeText = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setOutputText(
        "AI has completely changed how we create content these days. With smart tools at our fingertips, writing has become so much easier and faster. These innovations have genuinely made a difference in how productive we can be across different areas of work."
      );
      setIsProcessing(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            See the <span className="text-gradient">Difference</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste your AI-generated text and watch it transform into natural, human-sounding writing instantly.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="relative">
              <div className="absolute -top-3 left-4 px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                AI Text Input
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-6 pt-8 rounded-2xl border-2 border-border bg-card text-foreground resize-none focus:outline-none focus:border-primary transition-colors"
                placeholder="Paste your AI-generated text here..."
              />
              <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
                {inputText.length} characters
              </div>
            </div>

            {/* Output Panel */}
            <div className="relative">
              <div className="absolute -top-3 left-4 px-3 py-1 gradient-primary text-primary-foreground text-sm font-medium rounded-full flex items-center gap-1">
                <Sparkles size={14} />
                Humanized Output
              </div>
              <div className="w-full h-64 p-6 pt-8 rounded-2xl border-2 border-primary/30 bg-primary/5 text-foreground overflow-auto">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Humanizing your text...</span>
                    </div>
                  </div>
                ) : outputText ? (
                  <p className="leading-relaxed">{outputText}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Your humanized text will appear here...
                  </p>
                )}
              </div>
              {outputText && !isProcessing && (
                <button
                  onClick={handleCopy}
                  className="absolute bottom-4 right-4 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-8">
            <Button
              variant="hero"
              size="xl"
              onClick={humanizeText}
              disabled={isProcessing || !inputText.trim()}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Try This Demo
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
          </div>

          {/* AI-Likeness Score */}
          {outputText && !isProcessing && (
            <div className="flex justify-center mt-6 animate-fade-in">
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-card border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm text-muted-foreground">Before: 94% AI Detected</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-primary">After: 2% AI Detected</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
