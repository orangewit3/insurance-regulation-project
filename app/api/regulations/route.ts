import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { InsuranceRegulationSchema } from "@/lib/types"

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Missing Supabase credentials" },
      { status: 500 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data, error } = await supabase
      .from("state_bill_entries")
      .select("*")

    if (error) {
      throw new Error(`Error fetching data: ${error.message}`)
    }

    if (data && data.length > 0) {
      console.log("First row structure:", data[0])
    }

    const validatedBills = data
      .map((bill) => {
        const parsed = InsuranceRegulationSchema.safeParse(bill)
        if (!parsed.success) {
          console.error("Validation Error:", parsed.error.format())
          return null
        }
        return parsed.data
      })
      .filter(Boolean)

    return NextResponse.json({ bills: validatedBills })
  } catch (err) {
    console.error("API Error:", err)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}