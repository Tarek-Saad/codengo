"use server";

import { desc } from "drizzle-orm";
import { userProgress } from "@/db/schema";
import db from "@/db/drizzle";

export const getLeaderboard = async () => {
  const users = await db.query.userProgress.findMany({
    orderBy: [desc(userProgress.points)],
  });

  return users.map((user, index) => ({
    id: user.userId,
    name: user.userName,
    points: user.points || 0,
    rank: index + 1,
    userImageSrc: user.userImageSrc
  }));
};
