import csv
import json
from openai import OpenAI
import os
from typing import Dict, List

# Initialize OpenAI client
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

P1_underwriting_rules = """
Below is the extracted underwriting rules from the Short-term Care insurance underwriting guide in text form:

1. Applicant Eligibility
• Age Requirement: Applicants must be between 40 and 89 years old.

2. Health Questions and Plan Qualification
• Question 1: Applicants must answer "No" to being confined, receiving assistance, or needing supervision for cognitive impairment or daily activities. A "Yes" response renders the applicant ineligible.
• Questions 2–6:
 – If all answers are "No," the application proceeds to questions 7–11.
 – If any answer is "Yes," the applicant may qualify only for a Limited Benefit Rider—provided that, in a multi-applicant submission, at least one applicant answers "No" to these questions. (If both applicants answer "Yes," neither qualifies.)
• Questions 7–11:
 – If all answers are "No," the applicant qualifies for the Essential Care Plus plan.
 – Any "Yes" answer qualifies the applicant for the Essential Care plan.

3. Physical Build Requirements
• Height & Weight: The applicant's height and weight must fall within the specified ranges provided in the build chart. If an applicant falls outside these ranges, they are not eligible for coverage.

4. Application Completeness and Accuracy
• All personal data fields (full legal name, gender, complete residence address including any apartment or unit numbers, telephone number, and tobacco usage) must be accurately completed.
• If the application indicates a replacement of an existing policy, all replacement-related questions must be fully completed and any required replacement forms provided.

5. Medical and Prescription Information
• Detailed prescription information (name, dosage, quantity, frequency, diagnosis, start date) should be provided if available.
• A review of the applicant's prescription and medical history is performed to help determine eligibility and the appropriate plan or rate class.

6. Primary Care Physician Information
• The applicant must provide the name of their primary care physician.
• If a clinic is used instead of a physician, the applicant must have visited that clinic at least twice in the last two years.
• Hospitals, urgent care, or emergency care facilities cannot be listed as the primary source of care.

7. Underwriting Review Process
• Underwriting is based on several factors including the application responses, the review of prescription and medical history, any claim history, and—if needed—a telephone interview for clarification.
• If an instant decision cannot be made, the application is forwarded to the underwriting team for additional review.

8. Adjustments and Communication
• If an applicant is deemed ineligible for the selected plan or rate class, an underwriting offer or denial is communicated via email.
• The agent must reselect benefits in accordance with the offered plan rules.
• Failure to respond to the underwriting offer within 5 business days will result in the application being closed.

9. Effective Date Requirements
• The requested effective date must be after the signed date of the application and may be up to 90 days in the future.

10. Authorized Signatures and Proxy Documentation
• Each proposed insured must sign the application personally.
• In cases where a power of attorney (POA), guardian, or conservator signs on behalf of the applicant, all proper legal documentation must be submitted at the time of application.
• Instant decisioning will not be available for applications signed by a proxy.

These rules collectively define the criteria and procedures used during the underwriting process for Wellabe's Short-term Care insurance.
"""

P2_underwriting_rules = """
Below is an analysis of the underwriting guidelines contained in the MassMutual Preferred Underwriting Guidelines document. This analysis is presented in text form and summarizes the key rules, eligibility requirements, and risk classification criteria.

Overview and Purpose
• The document is intended for financial professionals and is not meant for public use.
• It outlines the criteria for MassMutual's preferred underwriting for life insurance (both term and permanent products) by assigning risk classifications based on health and lifestyle factors.
• Preferred risk classes available include:
 – Ultra Preferred Non-Tobacco
 – Select Preferred Non-Tobacco
 – Select Preferred Tobacco
• Minimum face amounts and age requirements are specified, and there is a maximum lifetime aggregate for certain products (e.g., ART and VTART).

Initial Eligibility Requirements
Before a proposed insured can be considered for a preferred risk class, they must meet these basic criteria:
• Aviation: Some private pilots may qualify for preferred classes, even with an extra premium, pending underwriting review.
• Cancer History: No cancer rating in the last 10 years (regardless of diagnosis or treatment timing). A permanent flat extra or table rating for cancer disqualifies preferred classification now or in the future.
• Driving History: No more than two moving violations in the past three years and no DUI/DWI within the past five years.
• Drug/Alcohol Use: No history of drug or alcohol abuse or treatment for such issues in the past 10 years.
• Medical Impairment Ratings: There should be no current ratings for any medical impairment.
• Residency/Foreign Travel: Must meet current residency and travel underwriting guidelines.
• Tobacco/Nicotine Use:
 – For Non-Tobacco classes (Ultra Preferred and Select Preferred Non-Tobacco): A negative urinalysis is required and no tobacco or nicotine use in the past 12 months.
 – Occasional cigar smokers may be eligible if they smoke no more than 24 cigars per year and have a negative urinalysis.
• Occupation: No "ratable" occupation is allowed.
• Avocation: Certain hobbies or activities may be rated, but in many cases, a favorable avocation (i.e., no adverse rating) can add to the insured's profile.

Risk Classification and Preferred Points
Once the initial eligibility is met, the proposed insured's overall risk classification is determined by accumulating points through either the traditional underwriting process or via the MassMutual® Mortality Score (M3S) through algorithmic underwriting. Key details include:
• Preferred Risk Classifications:
 – Ultra Preferred Non-Tobacco requires a minimum of 10 points.
 – Select Preferred Non-Tobacco requires 8 points.
 – Select Preferred Tobacco requires 7 points.
• Traditional Underwriting – Preferred Points Calculator:
 A set of criteria is assigned a certain number of points, which include:
  - Base Points: All proposed insureds start with 7 available points.
  - Avocation Rating: No adverse rating for avocation adds +1 point.
  - Blood Pressure or Blood Lipid Treatment: Not being under current treatment adds +1 point.
  - EBCT (Electron Beam Computerized Tomography): A favorable test result within the last 5 years adds +2 points.
  - Family History: No cardiovascular disease in either parent before age 60 adds +1 point.
  - Lab Results: Current blood/urine results (excluding blood lipids) within normal limits add +1 point.
  - Nicotine/Tobacco Use: No use in the last 2 years adds +1 point.
 • Additional age‐ and gender-specific criteria are also considered. For example:
  - For insureds over 60 years old, favorable NTproBNP levels or a normal EKG/stress test/angiography can add points.
  - Gender-specific blood pressure targets and body mass index (BMI) ranges are also applied, with points assigned for being within optimal ranges.
  - Cholesterol/HDL ratio targets differ by gender, with additional points available for meeting these benchmarks.

Overall Considerations
• The underwriting guidelines are designed to reward healthy lifestyles and favorable medical histories by awarding points that help a proposed insured qualify for a preferred risk class.
• The point system under traditional underwriting provides a structured way to quantify various health and lifestyle factors, ensuring consistency in risk classification.
• Algorithmic underwriting (M3S) may replace the traditional point system in some cases, but the underlying factors remain similar.
• These guidelines are applicable across a range of life insurance products, with specific minimum and maximum face amounts and age requirements detailed for term and permanent products.

This analysis provides a textual summary of the key underwriting rules as set out by MassMutual for their preferred underwriting process. The document's focus is on assessing overall health, lifestyle, and risk factors to assign a risk class that then influences the premium and policy eligibility.
"""

def get_enhanced_explanation(bill: str, summary: str, current_explanation: str, state: str, insurance_company: str, underwriting_rules: str) -> str:
    """Get enhanced explanation using OpenAI API"""
    prompt = f"""
    Analyze this insurance regulatory bill and its impact:
    
    State: {state}
    Bill: {bill}
    Summary: {summary}
    Current Analysis: {current_explanation}
    insurance product: {insurance_company}
    underwriting rules: {underwriting_rules}
    
    Please think about all the different ways this regulatory bill can impact the insurance policy company and the underwriting guidelines. 
    Follow this criteria for your analysis:
    
    1. Which departments are impacted and need to adapt to this change? Consider:
       - Sales
       - New Product Team
       - Underwriting
       - Actuaries
       - Legal
       - Risk & Compliance
       - Claims
       - Policy Administration
       - Customer Experience
       - Training
       (Include only relevant departments)
    
    2. Which pages or guidelines/rules within the Underwriting document are related to or impacted by this regulatory change?
    
    3. What are the next steps? What should each impacted team do to ensure compliance with the regulatory change?
    
    Please provide a comprehensive yet concise analysis. Keep each explanation as 3 paragraphs one for each criteria above keep the total under 300 words 
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert insurance regulatory analyst."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error getting enhanced explanation: {e}")
        return current_explanation

def process_csv(input_file: str, output_file: str):
    """Process input CSV and enhance explanations for affected rules"""
    rows = []
    updated_count = 0
    
    # Read input CSV
    with open(input_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        fieldnames = reader.fieldnames
        
        for row in reader:
            # Check if P1 or P2 is affected
            is_p1_affected = row.get('isRuleP1Affected', '').lower() == 'true'
            is_p2_affected = row.get('isRuleP2Affected', '').lower() == 'true'
            
            if is_p1_affected or is_p2_affected:
                print(f"Processing bill: {row.get('bill', 'Unknown Bill')}")
                
                # Enhance P1 explanation if affected
                if is_p1_affected:
                    enhanced_exp = get_enhanced_explanation(
                        row['bill'],
                        row.get('summary', ''),
                        row.get('P1EffectExplanation', ''),
                        row.get('state', ''),
                        "Wellabe's Short-term Care insurance",
                        P1_underwriting_rules
                    )
                    row['P1EffectExplanation'] = enhanced_exp
                    updated_count += 1
                
                # Enhance P2 explanation if affected
                if is_p2_affected:
                    enhanced_exp = get_enhanced_explanation(
                        row['bill'],
                        row.get('summary', ''),
                        row.get('P2EffectExplanation', ''),
                        row.get('state', ''),
                        "MassMutual Life Insurance",
                        P2_underwriting_rules
                    )
                    row['P2EffectExplanation'] = enhanced_exp
                    updated_count += 1
            
                rows.append(row)
    
    # Write enhanced data to output CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\nProcessing complete:")
    print(f"Total rows processed: {len(rows)}")
    print(f"Explanations enhanced: {updated_count}")

if __name__ == "__main__":
    input_file = "wy_bills_output_final.csv"  # Update with your input file name
    output_file = "wy_bills_output_refined_final.csv"
    process_csv(input_file, output_file)
