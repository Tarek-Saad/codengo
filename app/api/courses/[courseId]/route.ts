import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: { courseId: number } }
) => {
  if (!getIsAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 }); 
  }

  const data = await db.query.courses.findFirst({
    where: eq(courses.id, params.courseId), 
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: { courseId: number } }
) => {
  if (!getIsAdmin()) { // تم تصحيح lisAdmin إلى isAdmin
    return new NextResponse("Unauthorized", { status: 403 }); // تم تصحيح الاقتباسات
  }

  const body = await req.json();
  const data = await db.update(courses).set({
    ...body, 
  }).where(eq(courses.id, params.courseId)).returning(); 

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { courseId: number } }
) => {
  if (!getIsAdmin()) { // تم تصحيح lisAdmin إلى isAdmin
    return new NextResponse("Unauthorized", { status: 403 }); // تم تصحيح الاقتباسات
  }

  const data = await db.delete(courses)
    .where(eq(courses.id, params.courseId)) // تم تصحيح courseld إلى courseId
    .returning();

  return NextResponse.json(data[0]); // إرجاع البيانات المحذوفة كاستجابة JSON
};