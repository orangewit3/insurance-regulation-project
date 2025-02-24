import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { InsuranceRegulationSchema } from "@/lib/types"

export async function GET() {
  // First, verify our environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials:", { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey 
    })
    return NextResponse.json(
      { error: "Missing Supabase credentials" },
      { status: 500 }
    )
  }

  try {
    // Create the Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })

    // Test the connection
    const { data, error } = await supabase
      .from("state_bill_entries")
      .select("*")
      .limit(1)

    if (error) {
      console.error("Supabase query error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    // If test successful, get all data
    const { data: allData, error: allDataError } = await supabase
      .from("state_bill_entries")
      .select("*")

    if (allDataError) {
      console.error("Failed to fetch all data:", allDataError)
      throw new Error(`Failed to fetch all data: ${allDataError.message}`)
    }

    if (!allData) {
      return NextResponse.json({ bills: [] })
    }

    console.log("Successfully fetched data. First row:", allData[0])

    const validatedBills = allData
      .map((bill) => {
        const parsed = InsuranceRegulationSchema.safeParse(bill)
        if (!parsed.success) {
          console.error("Validation Error for bill:", bill.bill, parsed.error.format())
          return null
        }
        return parsed.data
      })
      .filter(Boolean)

    return NextResponse.json({ bills: validatedBills })
  } catch (err) {
    console.error("API Error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    )
  }
}