import { Navbar } from "@/components/navbar"
import { RealLeaderboard } from "@/components/real-leaderboard"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <RealLeaderboard />
      </div>
    </div>
  );
};

export default Index;
