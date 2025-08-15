import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Home, 
  Users, 
  MessageCircle, 
  BookOpen, 
  Lightbulb,
  Calendar,
  Bell,
  Code2,
  Trophy,
  Star
} from "lucide-react";

const featureConfig = {
  feed: {
    icon: Home,
    title: "Social Feed",
    description: "Share achievements, coding progress, and connect with fellow 42 students",
    progress: 0,
    features: [
      "📝 Share daily coding progress",
      "🏆 Celebrate project completions",
      "💡 Ask questions and get help",
      "📸 Share workspace setups",
      "🎯 Set and track coding goals"
    ],
    tips: [
      "Follow top performers to learn from their journey",
      "Share your debugging victories and failures",
      "Use hashtags like #42school #coding #peer-learning",
      "Celebrate small wins - every line of code counts!"
    ],
    eta: "Q2 2024"
  },
  groups: {
    icon: Users,
    title: "Study Groups",
    description: "Form study groups, collaborate on projects, and learn together",
    progress: 0,
    features: [
      "👥 Create project-specific teams",
      "📅 Schedule study sessions",
      "🔗 Share resources and notes",
      "💬 Group chat and voice calls",
      "📊 Track group progress"
    ],
    tips: [
      "Join groups for projects you're working on",
      "Create study groups for challenging subjects",
      "Mix students from different levels for peer mentoring",
      "Regular check-ins keep everyone motivated"
    ],
    eta: "Q1 2024"
  },
  messages: {
    icon: MessageCircle,
    title: "Direct Messages",
    description: "Private messaging for collaboration and peer support",
    progress: 0,
    features: [
      "💬 Real-time messaging",
      "📁 File and code sharing",
      "🔔 Smart notifications",
      "🔍 Message search and history",
      "👤 User presence indicators"
    ],
    tips: [
      "Ask for help when you're stuck - everyone's been there!",
      "Share useful resources you find",
      "Offer help to students on earlier projects",
      "Build your network within the 42 community"
    ],
    eta: "Q3 2024"
  },
  resources: {
    icon: BookOpen,
    title: "Learning Resources",
    description: "Community-driven tutorials, guides, and study materials",
    progress: 0,
    features: [
      "📚 Curated learning paths",
      "📝 Student-written tutorials",
      "🎥 Video explanations",
      "⭐ Rating and review system",
      "🔖 Personal bookmarks"
    ],
    tips: [
      "Contribute your own explanations to help others",
      "Rate resources to help the community",
      "Create study guides for complex topics",
      "Share alternative approaches to problems"
    ],
    eta: "Q1 2024"
  }
};

export default function ComingSoon() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const feature = searchParams.get('feature') || 'feed';
  const config = featureConfig[feature] || featureConfig.feed;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leaderboard
            </Button>
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Feature Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{config.title}</CardTitle>
                    <CardDescription className="text-base">
                      {config.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Development Progress</span>
                    <span className="text-sm text-muted-foreground">{config.progress}%</span>
                  </div>
                  <Progress value={config.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected release: {config.eta}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Planned Features
                  </h3>
                  <ul className="space-y-2">
                    {config.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Tips & Community */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Tips for When It's Ready
                </CardTitle>
                <CardDescription>
                  Make the most of this feature when it launches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {config.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Feature Navigation */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Other Features in Development</CardTitle>
              <CardDescription>
                Explore what else is coming to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(featureConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const isActive = key === feature;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => navigate(`/coming-soon?feature=${key}`)}
                      className={`p-4 rounded-lg border transition-colors text-left ${
                        isActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <h3 className="font-medium text-sm">{config.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={config.progress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {config.progress}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Stay Focused on Your Journey</h3>
              <p className="text-muted-foreground mb-4">
                While we build these social features, keep climbing that leaderboard! 
                Your current progress and achievements are what matter most.
              </p>
              <Button onClick={() => navigate('/')}>
                Back to Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
