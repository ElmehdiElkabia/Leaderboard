import { Navbar } from "@/components/navbar"
import { Leaderboard } from "@/components/leaderboard"
import { mockStudents } from "@/lib/mock-data"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Leaderboard students={mockStudents} />
    </div>
  );
};

export default Index;
