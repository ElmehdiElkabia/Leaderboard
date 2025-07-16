import { Navbar } from "@/components/navbar"
import { Leaderboard } from "@/components/leaderboard"
import { mockStudents } from "@/lib/mock-data"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Leaderboard students={mockStudents} />
      </div>
    </div>
  );
};

export default Index;
