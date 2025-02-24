# Product Requirements Document (PRD)

## 1. Project Overview

You are building a web application that:
1. Fetches and displays 2024 insurance regulation changes in certain US states from a Supabase database.
2. Shows how these regulation changes impact existing underwriting guidelines (e.g., Rule P1 or Rule P2).
3. Allows users to search and filter regulations by keywords, state, status, or specific rules impacted.

Technology stack (as specified):
* Next.js 14
* shadcn (UI components)
* Tailwind CSS
* Lucide Icons
* OpenAI (potentially for advanced summarization or other AI-driven features)
* Supabase (Postgres database)

## 2. Core Functionalities

### 2.1. Display Insurance-related regulation cards for 2024
1. Fetch data from a Supabase Postgres database, storing each row as an InsuranceRegulationDataObject.
2. Display each InsuranceRegulationDataObject as a list of cards.
   * Each card should show regulation information in a concise, elegant format.
   * Include a summarization section.
   * Highlight which underwriting rules (e.g., Rule P1 or Rule P2) are impacted.

### 2.2. Search Bar
1. The user can type keywords to filter which regulation cards appear.
2. Return the most relevant cards to the user's query.

### 2.3. Filters
1. The user can apply filters by:
   * Rules affected (isRuleP1Affected or isRuleP2Affected)
   * State (e.g., "CA", "NY", "All States")
   * Status (e.g., "Passed", "Pending")

## 3. Data Schema & Documentation

### 3.1 InsuranceRegulationDataObject

We will use a Zod schema to validate each regulation record fetched from Supabase. Below is the reference code snippet (for developer context only) that defines the schema:

```typescript
// Define the Zod schema for InsuranceRegulationDataObject
export const InsuranceRegulationDataObject = z.object({
  bill: z.string(),
  state: z.string(),
  session: z.string(),
  status: z.string(),
  isInsuranceRelated: z.boolean(),
  isRuleP1Affected: z.boolean(),
  isRuleP2Affected: z.boolean(),
  P1EffectExplanation: z.string(),
  P2EffectExplanation: z.string(),
  summary: z.string()
});
```

### 3.2 Fetching Data from Supabase

Below is the reference code snippet (for developer context) showing how we initialize Supabase and validate the data using Zod:

```typescript
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Ensure this is securely stored
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fetch data from Supabase
        const { data, error } = await supabase
            .from('state_bill_entries')
            .select('*');

        if (error) {
            throw new Error(`Error fetching data: ${error.message}`);
        }

        // Validate and transform data using Zod
        const validatedBills = data.map((bill) => {
            const parsedBill = InsuranceRegulationDataObject.safeParse(bill);

            if (!parsedBill.success) {
                console.error('Validation Error:', parsedBill.error.format());
                return null; // Handle validation failures as needed
            }

            return parsedBill.data;
        }).filter(Boolean); // Remove invalid entries

        return res.status(200).json({ bills: validatedBills });

    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
```

## 4. Minimal File Structure

The following structure is proposed to keep the project organized yet minimal. You may expand it later as the project grows:

```
.
├── README.md
├── app
│   ├── api
│   │   └── regulations
│   │       └── route.ts        // API route: fetch + Zod validate + return JSON
│   ├── favicon.ico
│   ├── globals.css             // Tailwind & global styles
│   ├── layout.tsx              // Next.js layout
│   └── page.tsx                // Main page: fetch data from /api/regulations,
│                               //           implement search & filter logic,
│                               //           render regulation cards
├── components
│   └── ui                      // Any shared UI components (if needed)
├── hooks
│   └── use-mobile.ts           // (Optional: if your app uses custom hooks)
├── instructions
│   └── instructions.md         // Existing instructions (optional)
├── lib
│   └── utils.ts                // (Optional: shared utilities)
├── next-env.d.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── ...
```

### Explanation of Folders and Files
1. **app/api/regulations/route.ts**
   * Central location for the API route to fetch data from Supabase and validate using Zod.
   * Returns a JSON object to the frontend.
2. **app/page.tsx**
   * Main entry point for the app's UI.
   * Fetches data from /api/regulations.
   * Implements the search & filter logic on the client side.
   * Displays a list of regulation cards (including a summarization section and the rules impacted).
3. **components/ui/**
   * If the team opts to move the "card" or other UI elements into separate components for reusability, they can place them here.
4. **globals.css**
   * Contains Tailwind setup and any global CSS needed.
5. **layout.tsx**
   * Defines the layout for Next.js 13/14, including `<html>`, `<body>`, etc.

## 5. Functional Requirements Detail

### 5.1. Fetching and Displaying Regulations
* The application must load all relevant 2024 insurance regulations from the state_bill_entries table in Supabase.
* Each regulation is validated against the Zod schema (InsuranceRegulationDataObject).
* Any records failing validation can be discarded or flagged in the logs for follow-up.
* Valid records are displayed on the main page as cards.

### 5.2. Card Structure
* Each card must display:
  * Bill identifier
  * State and Session
  * Status (e.g., "Passed" / "Pending")
  * Summary (short description)
  * Impact on Underwriting Guidelines:
    * If isRuleP1Affected is true, show P1EffectExplanation.
    * If isRuleP2Affected is true, show P2EffectExplanation.

### 5.3. Search
* Users can type a keyword (in the header, bill name, summary, or effect explanation) to narrow down cards.
* Search must be case-insensitive.
* Return only items that match the keyword.

### 5.4. Filters
* State filter: e.g., "All" or "Specific state name."
* Status filter: e.g., "Passed," "Pending," etc.
* Rule filter: e.g., "All Rules," "RuleP1," or "RuleP2."

### 5.5. Performance & UX
* The app should handle the use case of 10-50 new regulations added each month.
* The UI should remain responsive, especially with the help of Tailwind and Next.js optimizations.

## 6. Sample Endpoint Behavior

The main endpoint for retrieving data will be:

`GET /api/regulations`

Response format:

```json
{
  "bills": [
    {
      "bill": "AB 123",
      "state": "CA",
      "session": "2024",
      "status": "Passed",
      "isInsuranceRelated": true,
      "isRuleP1Affected": true,
      "isRuleP2Affected": false,
      "P1EffectExplanation": "Expands coverage for ...",
      "P2EffectExplanation": "",
      "summary": "This bill introduces new guidelines ..."
    },
    ...
  ]
}
```

## 7. Constraints & Considerations

### 7.1. Security
* Ensure the Supabase service role key and other secrets are stored securely (e.g., in environment variables).
* Validate all data from external sources to protect from unexpected formats or malicious input.

### 7.2. UI/UX
* Must remain consistent with brand guidelines if provided.
* Use Lucide Icons for any iconography.
* Must be accessible (consider color contrast, semantic HTML, etc.).

### 7.3. Scalability
* The data set may grow over time. Ensure search and filter logic remains performant.

## 8. Example Code for Context

(Below are snippets from previous discussions. They are included here only for reference and not as final implementation.)

### 8.1 API Route (app/api/regulations/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const InsuranceRegulationDataObject = z.object({
  bill: z.string(),
  state: z.string(),
  session: z.string(),
  status: z.string(),
  isInsuranceRelated: z.boolean(),
  isRuleP1Affected: z.boolean(),
  isRuleP2Affected: z.boolean(),
  P1EffectExplanation: z.string(),
  P2EffectExplanation: z.string(),
  summary: z.string(),
})

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { data, error } = await supabase
      .from("state_bill_entries")
      .select("*")

    if (error) {
      throw new Error(`Error fetching data: ${error.message}`)
    }

    const validatedBills = data
      .map((bill: unknown) => {
        const parsed = InsuranceRegulationDataObject.safeParse(bill)
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
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    )
  }
}
```

### 8.2 Main Page (app/page.tsx)

```typescript
"use client"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [bills, setBills] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    state: "",
    status: "",
    ruleAffected: "",
  })

  useEffect(() => {
    fetch("/api/regulations")
      .then((res) => res.json())
      .then((data) => {
        if (data?.bills) {
          setBills(data.bills)
        }
      })
      .catch((error) => console.error("Fetch error:", error))
  }, [])

  const filteredBills = bills.filter((bill) => {
    if (filters.state && bill.state !== filters.state) return false
    if (filters.status && bill.status !== filters.status) return false
    if (filters.ruleAffected === "RuleP1" && !bill.isRuleP1Affected) return false
    if (filters.ruleAffected === "RuleP2" && !bill.isRuleP2Affected) return false
    if (searchQuery) {
      const combinedText = `${bill.bill} ${bill.summary} ${bill.P1EffectExplanation} ${bill.P2EffectExplanation}`.toLowerCase()
      if (!combinedText.includes(searchQuery.toLowerCase())) {
        return false
      }
    }
    return true
  })

  return (
    <main className="p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Insurance Regulations Dashboard</h1>
        
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div className="flex space-x-2">
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">All States</option>
            {/* ... */}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">All Status</option>
            {/* ... */}
          </select>

          <select
            value={filters.ruleAffected}
            onChange={(e) =>
              setFilters({ ...filters, ruleAffected: e.target.value })
            }
            className="p-2 border rounded"
          >
            <option value="">All Rules</option>
            <option value="RuleP1">RuleP1</option>
            <option value="RuleP2">RuleP2</option>
          </select>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBills.map((bill) => (
          <RegulationCard key={bill.bill} bill={bill} />
        ))}
      </section>
    </main>
  )
}

function RegulationCard({ bill }: { bill: any }) {
  return (
    <article className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">
        {bill.bill} – {bill.state} ({bill.session})
      </h2>
      <p className="text-sm">
        <strong>Status:</strong> {bill.status}
      </p>
      <p className="text-sm mb-2">{bill.summary}</p>

      {bill.isRuleP1Affected && (
        <div className="text-xs bg-yellow-100 p-2 mb-2 rounded">
          <strong>Rule P1 Impact:</strong> {bill.P1EffectExplanation}
        </div>
      )}
      {bill.isRuleP2Affected && (
        <div className="text-xs bg-blue-100 p-2 mb-2 rounded">
          <strong>Rule P2 Impact:</strong> {bill.P2EffectExplanation}
        </div>
      )}
    </article>
  )
}
```

## 9. Key Outcomes
* A simple, modern Next.js application to query and display insurance regulations data from Supabase.
* End users can search quickly across all data points (bill name, state, summary, effect explanation).
* Filter by state, status, or impacted rule.
* The resulting UI helps the underwriting and compliance teams stay informed on how regulations may affect policy guidelines.

## 10. Next Steps
* Implement the above functionalities in a staging environment.
* Conduct testing of the search and filter logic on realistic data sets.
* Refine the design and user flows for clarity.
* Integrate with potential OpenAI services if advanced text summarization or deeper insights are needed.

**Important Note on Scope**

This PRD contains references to both code snippets and a recommended file structure for context. Actual implementation details may vary based on team preferences, best practices, or updates to Next.js, Tailwind, and associated libraries.