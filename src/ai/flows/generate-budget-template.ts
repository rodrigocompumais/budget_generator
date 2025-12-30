'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating visually appealing budget templates based on industry standards or popular design patterns.
 *
 * It includes:
 * - `generateBudgetTemplate`: A function to generate a budget template.
 * - `GenerateBudgetTemplateInput`: The input type for the generateBudgetTemplate function.
 * - `GenerateBudgetTemplateOutput`: The output type for the generateBudgetTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBudgetTemplateInputSchema = z.object({
  industry: z.string().describe('The industry for which the budget template is being created.'),
  templateStylePreferences: z.string().describe('Any specific template style preferences (e.g., modern, minimalist, classic).'),
  primaryColor: z.string().describe('The primary color to use in the template, in hex format (e.g., #1E3A8A).'),
  backgroundcolor: z.string().describe('The background color to use in the template, in hex format (e.g., #E6E9F2).'),
  accentColor: z.string().describe('The accent color to use in the template, in hex format (e.g., #D97706).'),
  fontFamily: z.string().describe('The font family to use in the template (e.g., Inter, Arial, Times New Roman).'),
});

export type GenerateBudgetTemplateInput = z.infer<typeof GenerateBudgetTemplateInputSchema>;

const GenerateBudgetTemplateOutputSchema = z.object({
  templateDataUri: z.string().describe('A data URI containing the generated budget template in HTML format.'),
});

export type GenerateBudgetTemplateOutput = z.infer<typeof GenerateBudgetTemplateOutputSchema>;

export async function generateBudgetTemplate(input: GenerateBudgetTemplateInput): Promise<GenerateBudgetTemplateOutput> {
  return generateBudgetTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBudgetTemplatePrompt',
  input: {schema: GenerateBudgetTemplateInputSchema},
  output: {schema: GenerateBudgetTemplateOutputSchema},
  prompt: `You are an expert designer specializing in creating visually appealing and professional budget templates.

  Based on the provided industry, style preferences, color scheme, and font family, generate an HTML-based budget template.
  The template should be well-structured, clean, and suitable for both desktop and mobile viewing.

  Industry: {{{industry}}}
  Template Style Preferences: {{{templateStylePreferences}}}
  Primary Color: {{{primaryColor}}}
  Background Color: {{{backgroundcolor}}}
  Accent Color: {{{accentColor}}}
  Font Family: {{{fontFamily}}}

  Return the complete HTML code as a data URI.

  Ensure the template incorporates the specified colors and font family effectively. Use modern design principles to create a professional and user-friendly template.
`,
});

const generateBudgetTemplateFlow = ai.defineFlow(
  {
    name: 'generateBudgetTemplateFlow',
    inputSchema: GenerateBudgetTemplateInputSchema,
    outputSchema: GenerateBudgetTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
