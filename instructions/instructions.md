# Project Requirements Document (PRD)

## 1. Project Overview

We are building a web application that displays insurance regulation changes in specific US states for the year 2024 and demonstrates how these changes impact a defined set of underwriting guidelines. The application will leverage Next.js 14, Shadcn/UI, TailwindCSS, Lucide icons, and OpenAI.

We will collect regulation data by scraping publicly available state legislature websites (initially Wyoming and New York), then process and analyze this data to determine which underwriting rules may be affected. The results are stored in local JSON files and displayed in the UI as cards, complete with search and filter capabilities.

## 2. Objectives

1. Scrape regulation data from relevant websites for the 2024 session.
2. Determine insurance-related impact by analyzing each regulation with a prompt to OpenAI.
3. Store the processed regulation data locally in JSON format.
4. Display the regulations in a user-friendly UI, with interactive search and filters.
5. Provide clear documentation and lightweight file structure for ease of maintenance and future expansion.

## 3. Scope & Core Functionalities

### 3.1. Regulation Cards Display

* Scrape 2024 regulations from:
  * Wyoming Legislation 2024
  * NY Senate Legislation
* Use axios and cheerio to gather basic data (title, session, status, summary, etc.).
* Send this raw data to OpenAI to create a structured output, referencing our underwriting rules.
* Store the resulting objects in local JSON files (e.g., ny-insurance-regulations.json and wy-insurance-regulations.json).
* Render these objects as a list of cards. Each card includes:
  * Title
  * High-level regulation info
  * Short summary
  * Which underwriting rules are impacted

### 3.2. Search

* A search bar that filters cards based on keywords in their title or summary.

### 3.3. Filters

* Filter by rules affected (e.g., P1, P2, or None).
* Filter by state (NY, WY).
* Filter by status (e.g., "Passed", "In Committee", etc., depending on the website data).

## 4. Project File Structure

To keep the codebase lean yet maintain clarity, we propose the following minimal file/folder organization:

```
.
├── app
│   ├── api
│   │   └── regulations
│   │       └── route.ts       // Next.js Route Handler - triggers scraping, analysis, saving
│   ├── layout.tsx             // Global layout (header, footer, etc.)
│   ├── page.tsx               // Main page displaying regulation cards, search & filters
│   └── globals.css            // Global styles (Tailwind, shadcn/ui, etc.)
├── components
│   └── regulation-card.tsx    // Component: single regulation card UI
├── data
│   ├── ny-insurance-regulations.json
│   └── wy-insurance-regulations.json
├── lib
│   └── regulation-scraper.ts  // All scraping, analysis (OpenAI), Zod schemas, save logic
├── package.json
├── tsconfig.json
└── README.md
```

### Key Points:

* **app/api/regulations/route.ts:**
  * A single Next.js Route Handler that initiates the scraping for both WY and NY.
  * Calls a function to run each item through OpenAI and then saves the results.

* **lib/regulation-scraper.ts:**
  * Contains:
    1. Zod Schema for the InsuranceRegulationDataObject.
    2. Scraping functions for NY and WY websites using Axios & Cheerio.
    3. OpenAI request function to analyze each regulation.
    4. Save function to write the final JSON files.

* **data/*.json:**
  * Final, structured data from the scraping runs, stored as JSON.

* **components/regulation-card.tsx:**
  * Reusable UI component that displays a single regulation (title, summary, rules affected, etc.).

* **app/page.tsx:**
  * Main page that fetches the JSON data (server-side), renders the regulation cards, and provides search/filter controls.

## 5. Detailed Documentation

### 5.1 Insurance Regulation Schema

We rely on a Zod schema to keep our data consistent. The schema looks like this (for reference only):

```typescript
// Define the Zod schema for InsuranceRegulationDataObject
export const InsuranceRegulationDataObject = z.object({
  id: z.string(),
  state: z.enum(['NY', 'WY']),
  session: z.string(),
  title: z.string(),
  status: z.string(),
  isInsuranceRelated: z.boolean(),
  summary: z.string(),
  ruleAffected: z.enum(['P1', 'P2', 'None']),
  explanation: z.string().optional(),
  parametersAffected: z.string(),
});
```

### 5.2 OpenAI Structured Output

We need to analyze each regulation to see if it affects insurance underwriting. This is done by calling OpenAI with a prompt, providing both:
1. Regulation info (title, session, state, etc.)
2. Underwriting rules (text describing guidelines P1, P2, etc.)

#### Example Prompt & Response

```javascript
// (For reference only; actual code uses ChatCompletion)
const prompt = `
Analyze this regulation and determine its impact on insurance underwriting rules.

Regulation Information:
Title: {title}
Summary: {summary}
Status: {status}
State: {state}

Underwriting Rules:
{underwritingRules}

Please analyze the regulation and provide a structured output in the following JSON format:
{
  "id": "{id}",
  "state": "{state}",
  "session": "{session}",
  "title": "{title}",
  "status": "{status}",
  "isInsuranceRelated": boolean, // ...
  "summary": "brief summary",
  "ruleAffected": "P1" | "P2" | "None",
  "explanation": "explanation if relevant",
  "parametersAffected": "specific parameters impacted or 'none'"
}
`
```

OpenAI will return JSON, which we then parse with Zod to ensure validity.

### 5.3 Scraping Logic

We use two scraping functions, one each for NY and WY:

1. **scrapeNYSenateRegulations(underwritingRules: string)**
   * Makes a request with axios to https://www.nysenate.gov/search/legislation (with parameters set to gather all relevant bills).
   * Uses cheerio to parse HTML elements (div.c-block--bill), extracting:
     * Bill number (id)
     * Session (should include "2024")
     * Title
     * Status
     * Summary
   * For each scraped item belonging to 2024, calls our OpenAI analysis function.

2. **scrapeWyomingRegulations(underwritingRules: string)**
   * Similar approach, but the website layout is slightly different, so we parse table rows (table.table-legislation tr).
   * Extract the relevant columns (id, title, status, summary).
   * Call the analysis function for each row that matches the year 2024.

### 5.4 Saving the Data

Once the data is analyzed, we store it using saveRegulationData(), which:
1. Builds a filepath (e.g. data/ny-insurance-regulations.json).
2. Creates directories if needed.
3. Writes data (in JSON format) to disk.

Example (for reference):

```typescript
async function saveRegulationData(
  regulations: InsuranceRegulation[],
  state: 'NY' | 'WY'
): Promise<void> {
  const outputPath = path.join(process.cwd(), 'data', `${state.toLowerCase()}-insurance-regulations.json`);

  // Write JSON
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(regulations, null, 2),
    'utf8'
  );
}
```

### 5.5 Displaying the Regulations

* **Main Page (app/page.tsx)**
  * Loads JSON data server-side from ny-insurance-regulations.json and wy-insurance-regulations.json.
  * Renders all regulations in a grid of cards.
  * Provides a search bar and filters (by state, rule affected, status, etc.).

* **Card Component (components/regulation-card.tsx)**
  * Takes a single regulation object as a prop.
  * Displays its fields: title, state, status, summary, ruleAffected, etc.

### 5.6 Example Usage Flow

1. Developer/CI triggers a GET request to api/regulations/ (via app/api/regulations/route.ts).
2. The route:
   * Scrapes NY and WY 2024 data.
   * Passes each item to OpenAI for analysis.
   * Saves final JSON to data/ny-insurance-regulations.json and data/wy-insurance-regulations.json.
3. The main Next.js page reads the JSON on load and displays the combined data set.

## 6. Implementation Notes

1. **Minimizing Files**
   * All scraping, analysis, saving logic is in one file (lib/regulation-scraper.ts).
   * A single API route (api/regulations) orchestrates the entire data fetch/update pipeline.
   * One UI component for the regulation card.
   * The home page (page.tsx) loads data and orchestrates the display & filter logic.

2. **Search & Filter Implementation**
   * The simplest approach is to perform search & filtering on the server side if the data set is large, or do it client-side if the data set is modest.
   * We can store query parameters in the URL (e.g., ?search=car insurance&state=NY) to keep them visible, or store the filter state in local component state.

3. **OpenAI Rate Limits**
   * Depending on volume of regulations, we must ensure we are within OpenAI rate limits.

4. **Potential Expansions**
   * Additional states can be added by following the same scraping patterns.
   * The schema could be extended to handle more parameters or more rules.

## 7. Final Deliverables

1. Working Next.js Application that:
   * Scrapes 2024 regulations (NY & WY).
   * Analyzes them with OpenAI.
   * Persists to local JSON.
   * Displays them in a user-friendly UI with search and filters.

2. Data/Documentation in the repository:
   * data/*.json output files.
   * Clear instructions in the README about how to run scraping & serve the site.

3. Minimal, Organized File Structure ensuring easy onboarding for future developers.

## 8. References

* [Next.js Route Handlers](https://nextjs.org/docs)
* [shadcn/UI](https://ui.shadcn.com/)
* [Tailwind CSS Docs](https://tailwindcss.com/docs)
* [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
* [Axios](https://axios-http.com/docs/intro)
* [Cheerio](https://cheerio.js.org/)
* [Zod](https://zod.dev/)
* [Lucide Icons](https://lucide.dev/)