import db from "@/db/drizzle";
import { quizOptions } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: { optionId: number } }
) => {
  if (!getIsAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 }); 
  }

  const data = await db.query.quizOptions.findFirst({
    where: eq(quizOptions.id, params.optionId), 
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: { optionId: number } }
) => {
  if (!getIsAdmin()) { 
    return new NextResponse("Unauthorized", { status: 403 }); 
  }

  const body = await req.json();
  const data = await db.update(quizOptions).set({
    ...body, 
  }).where(eq(quizOptions.id, params.optionId)).returning(); 

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { optionId: number } }
) => {
  if (!getIsAdmin()) { 
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.delete(quizOptions)
    .where(eq(quizOptions.id, params.optionId)) 
    .returning();

  return NextResponse.json(data[0]); 
};