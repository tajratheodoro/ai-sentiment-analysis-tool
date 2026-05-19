export type LocalSentiment = "Positive" | "Neutral" | "Negative";

export type CategoryKey = "delivery" | "quality" | "service" | "price" | "checkout" | "other";

export type ProcessedFeedback = {
  id: string;
  feedback: string;
  sentiment: LocalSentiment;
  category: CategoryKey;
  confidence: number;
};

export type LocalAnalysis = {
  version: 1;
  createdAt: string;
  items: ProcessedFeedback[];
};

export type CategorySummary = {
  category: CategoryKey;
  count: number;
  percentage: number;
};

export type LocalReport = {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePercentage: number;
  categories: CategorySummary[];
};

type ModelStatus = "loading" | "ready" | "fallback";

const MAX_ITEMS = 120;
const MODEL_ID = "Xenova/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7";

const sentimentLabels = ["positive customer feedback", "neutral customer feedback", "negative customer feedback"];
const categoryLabels: Record<CategoryKey, string> = {
  delivery: "delivery delays",
  quality: "taste or quality issues",
  service: "customer service praise",
  price: "price complaints",
  checkout: "checkout or app issues",
  other: "other feedback",
};

let classifierPromise: Promise<unknown> | null = null;

function createAnalysisId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const randomPart =
    globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function"
      ? Array.from(globalThis.crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(36)).join("")
      : Math.random().toString(36).slice(2);

  return `analysis-${Date.now().toString(36)}-${randomPart}`;
}

export function normalizeFeedbackInput(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\]?\s*-?\s*/u, "")
        .replace(/^[^:]{1,40}:\s*/u, "")
        .trim(),
    )
    .filter((line) => line.length >= 3)
    .slice(0, MAX_ITEMS);
}

export async function parseCsvFeedback(file: File) {
  const Papa = (await import("papaparse")).default;

  return new Promise<string[]>((resolve, reject) => {
    Papa.parse<Record<string, string> | string[]>(file, {
      delimiter: "",
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error(results.errors[0]?.message ?? "CSV parse error"));
          return;
        }

        const rows = results.data
          .map((row) => {
            if (Array.isArray(row)) return row.find((cell) => String(cell ?? "").trim().length > 2) ?? "";
            const values = Object.values(row);
            const preferred = values.find((value, index) => {
              const key = Object.keys(row)[index]?.toLowerCase() ?? "";
              return /feedback|comment|message|review|avaliacao|comentario|mensagem/u.test(key) && String(value ?? "").trim().length > 2;
            });
            return preferred ?? values.find((value) => String(value ?? "").trim().length > 2) ?? "";
          })
          .map((value) => String(value).trim())
          .filter(Boolean)
          .slice(0, MAX_ITEMS);

        resolve(rows);
      },
      error: (error) => reject(error),
    });
  });
}

export async function analyzeFeedbackBatch(
  feedbacks: string[],
  onStatus: (status: ModelStatus) => void,
): Promise<LocalAnalysis> {
  const uniqueFeedbacks = Array.from(new Set(feedbacks.map((item) => item.trim()).filter((item) => item.length >= 3))).slice(0, MAX_ITEMS);

  let classifier: unknown;
  try {
    onStatus("loading");
    classifier = await getClassifier();
    onStatus("ready");
  } catch (error) {
    console.warn("Local AI model unavailable; using offline fallback.", error);
    onStatus("fallback");
  }

  const items: ProcessedFeedback[] = [];
  for (const feedback of uniqueFeedbacks) {
    const analyzed = classifier ? await analyzeWithModel(classifier, feedback) : analyzeWithFallback(feedback);
    items.push({
      id: createAnalysisId(),
      feedback,
      ...analyzed,
    });
  }

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    items,
  };
}

export function buildReport(analysis: LocalAnalysis | null): LocalReport {
  const items = analysis?.items ?? [];
  const total = items.length;
  const positive = items.filter((item) => item.sentiment === "Positive").length;
  const neutral = items.filter((item) => item.sentiment === "Neutral").length;
  const negative = items.filter((item) => item.sentiment === "Negative").length;

  const categories = (Object.keys(categoryLabels) as CategoryKey[])
    .map((category) => {
      const count = items.filter((item) => item.category === category).length;
      return {
        category,
        count,
        percentage: total ? Math.round((count / total) * 100) : 0,
      };
    })
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    total,
    positive,
    neutral,
    negative,
    positivePercentage: total ? (positive / total) * 100 : 0,
    categories,
  };
}

export function validateImportedAnalysis(value: unknown): LocalAnalysis {
  if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray((value as LocalAnalysis).items)) {
    throw new Error("Invalid analysis file");
  }

  return {
    version: 1,
    createdAt: typeof (value as LocalAnalysis).createdAt === "string" ? (value as LocalAnalysis).createdAt : new Date().toISOString(),
    items: (value as LocalAnalysis).items
      .filter((item) => typeof item.feedback === "string")
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : createAnalysisId(),
        feedback: item.feedback,
        sentiment: isSentiment(item.sentiment) ? item.sentiment : "Neutral",
        category: isCategory(item.category) ? item.category : "other",
        confidence: typeof item.confidence === "number" ? item.confidence : 0,
      })),
  };
}

async function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = import("@xenova/transformers")
      .then(async ({ env, pipeline }) => {
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        return pipeline("zero-shot-classification", MODEL_ID, { quantized: true });
      })
      .catch((error) => {
        classifierPromise = null;
        throw error;
      });
  }

  return classifierPromise;
}

async function analyzeWithModel(classifier: unknown, feedback: string): Promise<Omit<ProcessedFeedback, "id" | "feedback">> {
  const run = classifier as (text: string, labels: string[]) => Promise<{ labels: string[]; scores: number[] }>;
  const [sentimentResult, categoryResult] = await Promise.all([
    run(feedback, sentimentLabels),
    run(feedback, Object.values(categoryLabels)),
  ]);

  return {
    sentiment: mapSentiment(sentimentResult.labels[0]),
    category: mapCategory(categoryResult.labels[0]),
    confidence: Math.round((sentimentResult.scores[0] ?? 0) * 100) / 100,
  };
}

function analyzeWithFallback(feedback: string): Omit<ProcessedFeedback, "id" | "feedback"> {
  const text = feedback.toLowerCase();
  const positive = countMatches(text, ["otimo", "excelente", "amei", "bom", "rapido", "perfeito", "obrigado", "great", "love", "fast", "helpful"]);
  const negative = countMatches(text, ["ruim", "atraso", "demora", "frio", "problema", "caro", "quebrado", "bad", "slow", "late", "terrible", "refund"]);

  return {
    sentiment: positive > negative ? "Positive" : negative > positive ? "Negative" : "Neutral",
    category: inferCategory(text),
    confidence: Math.min(0.95, Math.max(0.52, Math.abs(positive - negative) / 5 + 0.55)),
  };
}

function countMatches(text: string, words: string[]) {
  return words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
}

function inferCategory(text: string): CategoryKey {
  if (/atras|demor|entrega|delivery|late|delay/u.test(text)) return "delivery";
  if (/sabor|qualidade|frio|queimad|gosto|taste|quality|cold/u.test(text)) return "quality";
  if (/atendimento|atendente|suporte|educad|service|support|helpful/u.test(text)) return "service";
  if (/preco|caro|valor|price|expensive/u.test(text)) return "price";
  if (/app|checkout|pagamento|site|payment/u.test(text)) return "checkout";
  return "other";
}

function mapSentiment(label = ""): LocalSentiment {
  if (label.includes("positive")) return "Positive";
  if (label.includes("negative")) return "Negative";
  return "Neutral";
}

function mapCategory(label = ""): CategoryKey {
  const entry = (Object.entries(categoryLabels) as Array<[CategoryKey, string]>).find(([, value]) => value === label);
  return entry?.[0] ?? "other";
}

function isSentiment(value: unknown): value is LocalSentiment {
  return value === "Positive" || value === "Neutral" || value === "Negative";
}

function isCategory(value: unknown): value is CategoryKey {
  return typeof value === "string" && value in categoryLabels;
}
