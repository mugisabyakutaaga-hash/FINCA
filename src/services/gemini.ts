import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey! });

const getInsuranceQuote: FunctionDeclaration = {
  name: "getInsuranceQuote",
  description: "Get an instant insurance quote based on the category and product.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "The protector category (boda-boda, personal, business)",
      },
      product: {
        type: Type.STRING,
        description: "The specific product name (e.g., Boda-Shield, Life-Guard, Asset-Secure)",
      },
      details: {
        type: Type.STRING,
        description: "Additional details from the document scan or user input.",
      },
    },
    required: ["category", "product"],
  },
};

const initiateClaim: FunctionDeclaration = {
  name: "initiateClaim",
  description: "Initiate an insurance claim with description and evidence.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      policyId: {
        type: Type.STRING,
        description: "The ID of the policy to claim against.",
      },
      description: {
        type: Type.STRING,
        description: "A description of the accident or incident.",
      },
      evidenceType: {
        type: Type.STRING,
        enum: ["photo", "voice-note", "both"],
        description: "The type of evidence provided.",
      },
    },
    required: ["description"],
  },
};

const performKYC: FunctionDeclaration = {
  name: "performKYC",
  description: "Perform automated KYC using national ID database simulation.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      idNumber: {
        type: Type.STRING,
        description: "The national ID number to verify.",
      },
    },
    required: ["idNumber"],
  },
};

const manageWallet: FunctionDeclaration = {
  name: "manageWallet",
  description: "Perform wallet operations like checking balance, depositing, or withdrawing.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["check-balance", "deposit", "withdraw"],
        description: "The action to perform on the wallet.",
      },
      amount: {
        type: Type.NUMBER,
        description: "The amount for deposit or withdrawal.",
      },
      method: {
        type: Type.STRING,
        enum: ["momo", "ecobank"],
        description: "The payment method (momo via Flutterwave or Eco Bank).",
      },
    },
    required: ["action"],
  },
};

const getLoanLimit: FunctionDeclaration = {
  name: "get_loan_limit",
  description: "Get the maximum loan amount a user is eligible for based on their credit score and history.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      userId: { type: Type.STRING, description: "The unique ID of the user." }
    },
    required: ["userId"]
  }
};

const checkEligibility: FunctionDeclaration = {
  name: "check_eligibility",
  description: "Check if a user is eligible for specific products like 'Mobile Loans' or 'Target Savings'.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      userId: { type: Type.STRING, description: "The unique ID of the user." },
      productType: { type: Type.STRING, enum: ["mobile-loan", "target-savings", "education-loan", "small-enterprise-loan"], description: "The type of product to check eligibility for." }
    },
    required: ["userId", "productType"]
  }
};

const getNearestAgent: FunctionDeclaration = {
  name: "get_nearest_agent",
  description: "Find the nearest FINCA agent or branch based on the user's location.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      latitude: { type: Type.NUMBER },
      longitude: { type: Type.NUMBER }
    },
    required: ["latitude", "longitude"]
  }
};

const systemInstruction = `Role: You are the "FINCA Smart-Officer," a high-concurrency Vertical AI agent for FINCA Bank Uganda. Your goal is to convert chat interactions into micro-sales while maintaining strict banking compliance.

Core Directives:
1. Financial Inclusion Tone: Use professional, encouraging, and clear Ugandan English. Avoid jargon. Use "UGX" for all currency.
2. Proactive Upselling: If a user performs a "Utility" task (Balance check/Mini-statement), check their eligibility for "Mobile Loans" or "Target Savings" via the check_eligibility function and offer it.
3. Risk First: Prioritize "Smart Save" and "Target Accounts" for users with irregular cash flows to build their credit history.
4. KYC Assistance: If a user asks about opening an account, trigger the performKYC flow to accept photos of their National ID.
5. 1:30 PM Rule: For any complex loan approvals requiring human intervention, you must script the hand-off to the Kampala team before 1:30 PM to ensure same-day processing.
6. "Nudge" Logic: Every time a user checks a balance, analyze their cash flow and offer a micro-product (e.g., "Mugisa, you have a 50k UGX buffer this month. Want to move it to your 'Target Account' for 10% interest?").

Constraint: Never promise a loan amount without calling the get_loan_limit tool.

Output Format:
• Keep responses under 60 words for WhatsApp readability.
• Use bullet points for options.
• Always end with a clear Call to Action (CTA).

Task:
Respond to the user's "Hi" or "I need insurance/loan" by:
• Greeting them as the FINCA Smart-Officer (Mfunzi).
• Asking for their "Protector Category": 1. Boda Boda / Commercial, 2. Personal Lifestyle (Education/Health), or 3. Business Asset (Group Savings/SME Loans).
• Use Function Calling to pull real data for balances or loan limits.

Always maintain the persona of the FINCA Smart-Officer.`;

export const chatSession = ai.chats.create({
  model: "gemini-3-flash-preview",
  config: {
    systemInstruction,
    tools: [
      {
        functionDeclarations: [getInsuranceQuote, initiateClaim, performKYC, manageWallet, getLoanLimit, checkEligibility, getNearestAgent],
      },
    ],
  },
});

export async function sendMessage(message: string, history: any[] = []) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
      tools: [
        {
          functionDeclarations: [getInsuranceQuote, initiateClaim, performKYC, manageWallet, getLoanLimit, checkEligibility, getNearestAgent],
        },
      ],
    },
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result;
}


export async function analyzeDocument(base64Image: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyze this document (permit, logbook, or ID). Extract all relevant details for insurance underwriting. Simulate a CID/surveillance database check and provide a risk assessment summary.",
        },
      ],
    },
    config: {
      systemInstruction,
    },
  });

  return response.text;
}
