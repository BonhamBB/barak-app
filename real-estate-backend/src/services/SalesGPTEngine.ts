/**
 * SalesGPT Engine - TypeScript port of SalesGPT conversation logic
 * Ported from: SalesGPT/salesgpt/chains.py, prompts.py, stages.py, agents.py
 *
 * Full "Brain" transfer: All Sales Stages and instructions from the original Python code.
 */

import OpenAI from "openai";
import { Client } from "../models/Client";
import { Property } from "../models/Property";
import {
  SALES_AGENT_INCEPTION_PROMPT,
  STAGE_ANALYZER_INCEPTION_PROMPT,
} from "./prompts";

// ============ SALES STAGES (exact copy from stages.py) ============
export const CONVERSATION_STAGES: Record<string, string> = {
  "1": "Introduction: Start the conversation by introducing yourself and your company. Be polite and respectful while keeping the tone of the conversation professional. Your greeting should be welcoming. Always clarify in your greeting the reason why you are calling.",
  "2": "Qualification: Qualify the prospect by confirming if they are the right person to talk to regarding your product/service. Ensure that they have the authority to make purchasing decisions.",
  "3": "Value proposition: Briefly explain how your product/service can benefit the prospect. Focus on the unique selling points and value proposition of your product/service that sets it apart from competitors.",
  "4": "Needs analysis: Ask open-ended questions to uncover the prospect's needs and pain points. Listen carefully to their responses and take notes.",
  "5": "Solution presentation: Based on the prospect's needs, present your product/service as the solution that can address their pain points.",
  "6": "Objection handling: Address any objections that the prospect may have regarding your product/service. Be prepared to provide evidence or testimonials to support your claims.",
  "7": "Close: Ask for the sale by proposing a next step. This could be a demo, a trial or a meeting with decision-makers. Ensure to summarize what has been discussed and reiterate the benefits.",
  "8": "End conversation: It's time to end the call as there is nothing else to be said.",
};

// ============ Agent Configuration ============
export interface SalesGPTConfig {
  salesperson_name: string;
  salesperson_role: string;
  company_name: string;
  company_business: string;
  company_values: string;
  conversation_purpose: string;
  conversation_type: string;
}

export const DEFAULT_REAL_ESTATE_CONFIG: SalesGPTConfig = {
  salesperson_name: "Barak",
  salesperson_role: "Commercial Real Estate Advisor",
  company_name: "Barak Real Estate",
  company_business:
    "Barak Real Estate specializes in tech office space in Israel. We curate premium office listings with Tech Discount (20% Arnona savings for eligible tech companies) and provide a personalized dashboard for each client to compare properties with full financial breakdowns.",
  company_values:
    "We believe tech companies deserve transparent, hassle-free office hunting. Our mission is to match tech teams with the right space using clear cost comparisons and exclusive Tech Discount benefits.",
  conversation_purpose:
    "introduce our curated office properties and share their unique dashboard link where they can see all assigned properties with Tech Discount financial breakdowns.",
  conversation_type: "email",
};

// ============ SalesGPT Engine ============
export class SalesGPTEngine {
  private openai: OpenAI;
  private config: SalesGPTConfig;
  private model: string;

  conversation_history: string[] = [];
  conversation_stage_id: string = "1";
  current_conversation_stage: string = CONVERSATION_STAGES["1"];

  // Context injected from DB (client + dashboard link)
  private dashboardLink: string | null = null;
  private propertySummary: string | null = null;

  constructor(config?: Partial<SalesGPTConfig>, model = "gpt-4o-mini") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for SalesGPTEngine");
    }
    this.openai = new OpenAI({ apiKey });
    this.config = { ...DEFAULT_REAL_ESTATE_CONFIG, ...config };
    this.model = model;
  }

  /** Load client context from DB and set dashboard link + property summary */
  async loadClientContext(clientSlug: string, baseUrl: string): Promise<void> {
    const client = await Client.findOne({ where: { unique_slug: clientSlug } });
    if (!client) {
      this.dashboardLink = null;
      this.propertySummary = null;
      return;
    }

    this.dashboardLink = `${baseUrl}/dashboard/${client.unique_slug}`;

    const properties = await Property.findAll({
      where: { clientId: client.id },
      limit: 10,
    });

    if (properties.length === 0) {
      this.propertySummary = "No properties assigned yet.";
    } else {
      this.propertySummary = properties
        .map((p) => {
          const rent = Number(p.rentPerSqm) * Number(p.totalArea);
          const arnona = Number(p.arnonaPerSqm) * Number(p.totalArea) * 0.8;
          const total = rent + Number(p.mgmtFee) + arnona + Number(p.cleaningFee);
          return `- ${p.title} (${p.address || "N/A"}): ${p.totalArea}m², ~₪${Math.round(total).toLocaleString()}/mo with Tech Discount`;
        })
        .join("\n");
    }
  }

  /** Set dashboard link and property context manually (e.g. when sending email) */
  setContext(dashboardLink: string, propertySummary?: string): void {
    this.dashboardLink = dashboardLink;
    this.propertySummary = propertySummary ?? null;
  }

  private getConversationPurposeWithContext(): string {
    let purpose = this.config.conversation_purpose;
    if (this.dashboardLink) {
      purpose += ` YOUR KEY ACTION: When appropriate (Solution presentation or Close stage), share this link: ${this.dashboardLink}`;
      if (this.propertySummary) {
        purpose += ` The client's dashboard shows these properties: ${this.propertySummary}`;
      }
    }
    return purpose;
  }

  private retrieveConversationStage(key: string): string {
    return CONVERSATION_STAGES[key] ?? CONVERSATION_STAGES["1"];
  }

  /** Seed the agent - reset conversation */
  seedAgent(): void {
    this.conversation_stage_id = "1";
    this.current_conversation_stage = this.retrieveConversationStage("1");
    this.conversation_history = [];
  }

  /** Add human message to conversation history */
  humanStep(humanInput: string): void {
    this.conversation_history.push(`User: ${humanInput} <END_OF_TURN>`);
  }

  /** Determine next conversation stage via Stage Analyzer */
  async determineConversationStage(): Promise<void> {
    const conversationHistoryStr = this.conversation_history.join("\n").trim();
    const conversationStagesStr = Object.entries(CONVERSATION_STAGES)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const prompt = STAGE_ANALYZER_INCEPTION_PROMPT.replace(
      "{conversation_history}",
      conversationHistoryStr
    )
      .replace("{conversation_stage_id}", this.conversation_stage_id)
      .replace("{conversation_stages}", conversationStagesStr);

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 10,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "1";
    // Extract single digit (stage 1-8)
    const match = text.match(/^(\d)/);
    this.conversation_stage_id = match ? match[1] : "1";
    this.current_conversation_stage = this.retrieveConversationStage(
      this.conversation_stage_id
    );
  }

  /** Generate agent response (one step) */
  async step(): Promise<{ text: string; endOfCall: boolean }> {
    await this.determineConversationStage();

    const conversationHistoryStr = this.conversation_history.join("\n").trim();
    const conversationPurpose = this.getConversationPurposeWithContext();

    const prompt = SALES_AGENT_INCEPTION_PROMPT.replace(
      "{salesperson_name}",
      this.config.salesperson_name
    )
      .replace("{salesperson_role}", this.config.salesperson_role)
      .replace("{company_name}", this.config.company_name)
      .replace("{company_business}", this.config.company_business)
      .replace("{company_values}", this.config.company_values)
      .replace("{conversation_purpose}", conversationPurpose)
      .replace("{conversation_type}", this.config.conversation_type)
      .replace("{conversation_history}", conversationHistoryStr);

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
      stop: ["<END_OF_TURN>", "<END_OF_CALL>"],
    });

    let output =
      response.choices[0]?.message?.content?.trim() ?? "I apologize, I didn't catch that. Could you repeat?";
    const rawContent = response.choices[0]?.message?.content ?? "";

    const endOfCall = rawContent.includes("<END_OF_CALL>");
    output = output.replace(/<END_OF_TURN>/g, "").replace(/<END_OF_CALL>/g, "").trim();

    const agentName = this.config.salesperson_name;
    const fullOutput = `${agentName}: ${output}`;
    const toAppend =
      fullOutput + (rawContent.includes("<END_OF_TURN>") ? " <END_OF_TURN>" : "");
    this.conversation_history.push(toAppend);

    return { text: output, endOfCall };
  }

  /** Generate opening message (first turn, no user input yet) */
  async generateOpening(): Promise<string> {
    this.seedAgent();
    const result = await this.step();
    return result.text;
  }

  /** Full conversation turn: add user message, generate response */
  async chat(userMessage: string): Promise<{ text: string; endOfCall: boolean }> {
    this.humanStep(userMessage);
    return this.step();
  }

  /** Get dashboard link for current context */
  getDashboardLink(): string | null {
    return this.dashboardLink;
  }

  /** Get current stage ID */
  getStageId(): string {
    return this.conversation_stage_id;
  }

  /** Get conversation history (for persistence/debugging) */
  getConversationHistory(): string[] {
    return [...this.conversation_history];
  }

  /** Restore conversation state (e.g. from API persistence) */
  restoreState(conversationHistory: string[], stageId = "1"): void {
    this.conversation_history = [...conversationHistory];
    this.conversation_stage_id = stageId;
    this.current_conversation_stage = this.retrieveConversationStage(stageId);
  }

  /** Generate post-tour follow-up email (AI-drafted) */
  async generateTourSummary(propertySummaries: string[], clientDisplayName: string): Promise<string> {
    const dashboardLink = this.dashboardLink || "[dashboard link]";
    const propertyList = propertySummaries.length > 0
      ? propertySummaries.map((p) => `- ${p}`).join("\n")
      : "No properties assigned yet.";

    const prompt = `You are ${this.config.salesperson_name} from ${this.config.company_name}. Write a short, professional follow-up email (2-4 sentences) after a property tour with ${clientDisplayName}.

Context:
- These properties were just added to their personalized dashboard: ${propertyList}
- Dashboard link: ${dashboardLink}
- The client can view the full comparison with Tech Discount breakdown at the link.

Write only the email body (no subject, no greeting line like "Hi," - we'll add that). Keep it warm, concise, and action-oriented. Mention the specific properties briefly and invite them to view the dashboard.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content?.trim() ?? "Your dashboard has been updated with the properties we discussed. View the full comparison here: " + dashboardLink;
  }
}
