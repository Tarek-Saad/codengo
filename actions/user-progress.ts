"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { userProgress } from "@/db/schema";
import { redirect } from "next/navigation";
import { getCourseById } from "@/db/queries";
import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";


export const setActiveCourse = async (courseId: number) => {
    const {userId} = await auth();
    const User = await currentUser();

    if (!userId || !User) {
        throw new Error("User not found");
    };

    const course = await getCourseById(courseId);

    if (!course) {
        throw new Error("Course not found");
    };

    // if(!course.units.length || !course.units[0].lessons.length) {
    //     throw new Error("Course is empty");
    // };
    
    const existingProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    });

    if (existingProgress) {
        await db.update(userProgress).set({
            activeCourseId: courseId,
        }).where(eq(userProgress.userId, userId));

        revalidatePath("/courses");
        revalidatePath("/learn");
    
        redirect("/learn");
    } else {
        await db.insert(userProgress).values({
            userId: userId,
            userName: User.firstName! || "User",
            userImageSrc: User.imageUrl || "/mascot.svg",
            activeCourseId: courseId,
        });

    }

    revalidatePath("/courses");
    revalidatePath("/learn");

    redirect("/learn");
}
