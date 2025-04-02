import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("seeding start");
    await db.delete(schema.courses);
    await db.delete(schema.userProgress);

    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "NextJs Basics",
        imageSrc: "/nextjs.gif",
      },
      {
        id: 2,
        title: "Flutter Basics",
        imageSrc: "/flutter.gif",
      },
      {
        id: 3,
        title: "mySQL Basics",
        imageSrc: "/mysql.svg",
      },
    ]);

    console.log("seeding finished");
  } catch (error) {
    console.log(error);
    throw new Error("failed to seed DB");
  }
};

main();
