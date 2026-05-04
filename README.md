# Digital-ME 
*A Motivational Interview Strategy Engine & AI Persona Cloning System*

[English](#english) | [简体中文](#chinese)

---

<h2 id="english">English</h2>

## Overview
Digital-ME is an AI-powered "Motivational Interview Strategy Engine" designed to construct a hyper-personalized digital clone (Persona) of the user. Through progressive, sequential conversational interactions, the system extracts the user's deep psychological traits, core values, MBTI archetype, and key life memories.

## Features
- **Sequential Data Extraction**: Uses targeted probing questions following OARS principles (Open-ended questions, Affirmations, Reflections, Summarizing) to map the user's psyche.
- **Dynamic Profiling**: Continuously updates the user's psychological profile (Big Five Traits, MBTI, Values, Biography) in real-time as the conversation progresses.
- **Memory Hub**: Automatically distills key facts, beliefs, and preferences from the conversation into structured "Memory" nodes.
- **Exportable AI Persona**: Generates a standard `SKILL.md` document representing the user's "Digital Clone," which can be exported and used as system instructions for other AI agents (like Claude, Gemini, etc.).

## Tech Stack
- Frontend: React (Vite), TypeScript, Tailwind CSS, Motion.
- AI Engine: Google Gemini API (`@google/genai`).

## How to Use
1. **Interview Phase**: Engage with the AI. Answer its probing questions authentically. The AI will progressively increase the "Cloning Status" based on the completeness of information gathered.
2. **Profile / Memory Generation**: Every few messages, the AI will update your "Profile" and "Memory Hub" tabs in the background.
3. **Export Persona**: Once the cloning status reaches 100%, the process is complete. You can then download your `SKILL.md` file containing your digital identity instructions.

---

<h2 id="chinese">简体中文</h2>

## 概述
Digital-ME 是一个由 AI 驱动的“动机访谈 (MI) 策略引擎”，旨在构建用户高度个性化的数字克隆体（Persona/数字分身）。通过循序渐进的对话互动，系统会提取用户的深层心理特征、核心价值观、MBTI 原型以及关键的生活记忆。

## 核心功能
- **逐层数据提取**：使用结构化的探究性问题，遵循心理学 OARS 原则（开放式问题、肯定、反映、总结）来映射用户的心理状态。
- **动态画像生成**：随着对话的进行，实时更新用户的心理画像（包括大五人格特质、MBTI、价值观、个人传记）。
- **记忆中枢**：自动从对话中提炼关键事实、信念和偏好，形成结构化的“记忆”节点。
- **导出 AI 角色卡**：生成标准的 `SKILL.md` 文档代表用户的“数字克隆体”。该文档可导出并直接用作其他 AI 智能体（如 Claude 或 Gemini）的系统提示词/技能文档。

## 技术栈
- 前端：React (Vite), TypeScript, Tailwind CSS, Motion.
- AI 引擎：Google Gemini API (`@google/genai`).

## 使用方法
1. **深度访谈**：与 AI 进行沉浸式对话，真实地回答其提出的核心问题。AI 将根据收集信息的完整度，逐步增加“克隆进度状态”(Cloning Status)。
2. **画像与记忆生成**：每经过几轮对话，系统会自动通过后台处理您的数据，更新左侧的“心理画像” (Profile) 和“记忆中枢” (Memory Hub) 栏目。
3. **导出数字分身**：当克隆进度达到 100% 时，克隆阶段完成。您可以点击导出 `SKILL.md` 文件，获取您的专属数字身份指令集。
