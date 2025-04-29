import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Trophy, Award } from "lucide-react";
import Image from "next/image";
import { getLeaderboard } from "@/actions/get-leaderboard";

interface LeaderboardUser {
  id: number;
  name: string;
  points: number;
  rank: number;
  userImageSrc: string;
}

export default async function LeaderboardPage() {
  const users: LeaderboardUser[] = await getLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <Award className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="h-full p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                <div className="flex-shrink-0">
                  <Image
                    src={user.userImageSrc || "/mascot.svg"}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{user.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">{user.points}</span>
                  <span className="text-sm text-gray-500">points</span>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
