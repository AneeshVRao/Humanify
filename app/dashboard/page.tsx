"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  FileText,
  Settings,
  LogOut,
  Crown,
  AlertCircle,
  Clock,
  User,
  Menu,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Tone = "professional" | "casual" | "academic" | "creative";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5 });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);
    await fetchUsage();
    setIsLoading(false);
  };

  const fetchUsage = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch("/api/user/usage", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsage({
          used: data.data.dailyUsageCount || 0,
          limit: data.data.dailyLimit || 5,
        });
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to humanize");
      return;
    }

    if (inputText.length < 50) {
      toast.error("Text must be at least 50 characters long");
      return;
    }

    setIsHumanizing(true);
    setOutputText("");

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text: inputText,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.code === "RATE_LIMIT_EXCEEDED") {
          toast.error(data.error.message, {
            description: "Upgrade to Pro for unlimited humanizations",
            action: {
              label: "Upgrade",
              onClick: () => router.push("/pricing"),
            },
          });
        } else {
          toast.error(data.error.message);
        }
        setIsHumanizing(false);
        return;
      }

      setOutputText(data.data.humanizedText);
      setUsage({
        used: usage.used + 1,
        limit: usage.limit,
      });
      toast.success("Text humanized successfully!");
    } catch (error) {
      toast.error("Could not humanize text", {
        description: "Please check your connection and try again",
      });
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;

    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const usagePercentage = (usage.used / usage.limit) * 100;
  const remainingUses = usage.limit - usage.used;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl">Humanify</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {remainingUses} / {usage.limit} uses left
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">My Account</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/pricing")}>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/history")}>
                    <FileText className="mr-2 h-4 w-4" />
                    History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 space-y-2 animate-slide-up">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {remainingUses} / {usage.limit} uses left
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/pricing")}
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">
              Transform AI-generated text into natural, human-sounding writing
            </p>
          </div>

          {/* Usage Alert */}
          {remainingUses <= 1 && (
            <Alert className="mb-6 animate-scale-in border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription>
                You're running low on humanizations today.{" "}
                <Button
                  variant="link"
                  className="h-auto p-0 text-yellow-600 font-medium"
                  onClick={() => router.push("/pricing")}
                >
                  Upgrade to Pro
                </Button>{" "}
                for unlimited access.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Humanization Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Input Card */}
              <Card
                className="border-border/50 shadow-lg animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Original Text</CardTitle>
                      <CardDescription>
                        Paste your AI-generated text here
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <FileText className="w-3 h-3" />
                      {inputText.length} chars
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste your AI-generated text here (minimum 50 characters)..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] resize-none focus:scale-[1.005] transition-transform"
                    disabled={isHumanizing}
                  />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Select
                        value={tone}
                        onValueChange={(value) => setTone(value as Tone)}
                        disabled={isHumanizing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">
                            💼 Professional
                          </SelectItem>
                          <SelectItem value="casual">😊 Casual</SelectItem>
                          <SelectItem value="academic">🎓 Academic</SelectItem>
                          <SelectItem value="creative">🎨 Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleHumanize}
                      disabled={
                        isHumanizing ||
                        !inputText.trim() ||
                        inputText.length < 50
                      }
                      className="sm:w-auto w-full shadow-md hover:shadow-lg transition-all"
                    >
                      {isHumanizing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Humanizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Humanize Text
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Output Card */}
              {outputText && (
                <Card className="border-border/50 shadow-lg animate-scale-in border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Humanized Text
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                            <Check className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Your natural, human-sounding text
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {outputText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Usage Card */}
              <Card
                className="border-border/50 shadow-lg animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Daily Usage</CardTitle>
                  <CardDescription>Resets at midnight</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Used today</span>
                      <span className="font-medium">
                        {usage.used} / {usage.limit}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {remainingUses > 0
                        ? `You have ${remainingUses} humanization${
                            remainingUses !== 1 ? "s" : ""
                          } remaining today.`
                        : "You have used all your humanizations for today."}
                    </p>

                    <Button
                      variant="default"
                      className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={() => router.push("/pricing")}
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade to Pro
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pro Features Card */}
              <Card
                className="border-border/50 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Pro Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Unlimited humanizations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Priority processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Advanced AI models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Full history access</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
