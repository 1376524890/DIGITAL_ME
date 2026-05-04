/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Message, Profile, Memory } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class DigitalMeService {
  private ai: GoogleGenAI;

  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in the Secrets panel.");
    }
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async conductInterview(history: Message[]): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      config: {
        systemInstruction: "You are the 'MI Strategy Engine' for Digital-ME. Your goal is to conduct a Motivational Interview with the user to understand their deep motivations, personality, and life story. Apply OARS principles (Open-ended questions, Affirmations, Reflections, Summarizing). Be empathetic, analytical, and ask probing questions one at a time. Do not break character. Make your responses complete.",
        maxOutputTokens: 8192,
        temperature: 0.7,
      }
    });

    return response.text || "I am reflecting on your words. Can you tell me more?";
  }

  async extractProfile(history: Message[]): Promise<Profile> {
    const prompt = `Analyze the following interview history and extract a psychological profile of the user based on the Big Five Personality Traits (OCEAN) and psychological value frameworks. 
    Return a strictly valid JSON object exactly matching this structure:
    {
      "traits": ["trait1", "trait2", ...], // 5-7 core personality traits
      "mbti": "INTJ", // predicted MBTI
      "values": ["value1", "value2", ...], // 3-5 core life values
      "biography": "A short 2-3 sentence biography based on extracted data.",
      "completeness": 20 // an integer from 0 to 100 indicating how comprehensively the profile has been gathered. It should gradually increase (e.g. 10, 25, 40...) as more messages are exchanged and deeper insights are revealed. 100 means fully confident and complete.
    }

    INTERVIEW HISTORY:
    ${history.map(m => `${m.role}: ${m.content}`).join("\n")}
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonText = response.text || "{}";
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
  }

  async distillMemories(history: Message[]): Promise<Memory[]> {
    const prompt = `Identify key facts, events, beliefs, or preferences mentioned by the user in this interview run. Distill them into an array of memory objects.
    Each memory object MUST follow this strictly valid JSON array structure:
    [
      {
        "id": "unique-id-string",
        "category": "Childhood", // e.g., 'Childhood', 'Career', 'Relationship', 'Belief', 'Preference'
        "fact": "The distilled factual memory or statement."
      }
    ]

    INTERVIEW HISTORY:
    ${history.map(m => `${m.role}: ${m.content}`).join("\n")}
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonText = response.text || "[]";
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    const memories = JSON.parse(jsonText);
    
    return memories.map((m: any, index: number) => ({
      ...m,
      id: m.id || `mem-${Date.now()}-${index}`,
      timestamp: Date.now()
    }));
  }

  async generateSkillMd(profile: Profile, memories: Memory[]): Promise<string> {
    const prompt = `You are an expert prompt engineer and psychologist. Based on the provided psychological profile and memories, create a comprehensive system instruction document (SKILL.md format) that another AI or Agent can use to roleplay or act as a "Digital Clone" of this user.

    PROFILE:
    Traits: ${profile.traits.join(", ")}
    MBTI: ${profile.mbti}
    Values: ${profile.values.join(", ")}
    Biography: ${profile.biography}

    MEMORIES:
    ${memories.map(m => `- [${m.category}] ${m.fact}`).join("\n")}

    Output ONLY valid Markdown. Do not wrap in markdown code blocks, just raw markdown. Use the following structure:
    ---
    name: "Digital Clone Persona"
    description: "System instructions for emulating the user"
    ---
    # Identity Matrix
    [Describe the core identity]

    ## Psychological Traits (OCEAN & MBTI)
    [How personality impacts behavior]

    ## Core Values & Decision Making
    [How they make choices]

    ## Memory Context
    [Key facts guiding their worldview]

    ## Emulation Guidelines
    [Instructions on tone, style, and how to respond to questions as this person]
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 8192,
        temperature: 0.2,
      }
    });

    let mdText = response.text || "# SKILL: Digital Clone\nError generating clone data.";
    mdText = mdText.replace(/^```(markdown)?\n/i, '').replace(/\n```$/i, '');
    return mdText.trim();
  }
}

export const digitalMe = new DigitalMeService();
