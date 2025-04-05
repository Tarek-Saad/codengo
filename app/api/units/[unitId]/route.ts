import db from "@/db/drizzle";
import { units } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: { unitId: number } }
) => {
  if (!getIsAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 }); 
  }

  const data = await db.query.units.findFirst({
    where: eq(units.id, params.unitId), 
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: { unitId: number } }
) => {
  if (!getIsAdmin()) { // تم تصحيح lisAdmin إلى isAdmin
    return new NextResponse("Unauthorized", { status: 403 }); // تم تصحيح الاقتباسات
  }

  const body = await req.json();
  const data = await db.update(units).set({
    ...body, 
  }).where(eq(units.id, params.unitId)).returning(); 

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { unitId: number } }
) => {
  if (!getIsAdmin()) { // تم تصحيح lisAdmin إلى isAdmin
    return new NextResponse("Unauthorized", { status: 403 }); // تم تصحيح الاقتباسات
  }

  const data = await db.delete(units)
    .where(eq(units.id, params.unitId)) // تم تصحيح courseld إلى unitId
    .returning();

  return NextResponse.json(data[0]); // إرجاع البيانات المحذوفة كاستجابة JSON
};