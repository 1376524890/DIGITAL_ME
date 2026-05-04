/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Profile {
  traits: string[];
  mbti?: string;
  values: string[];
  biography: string;
  completeness: number;
}

export interface Memory {
  id: string;
  category: string;
  fact: string;
  timestamp: number;
}
