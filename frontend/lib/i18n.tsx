"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "ptbr" | "eng";

const STORAGE_KEY = "customer-sentiment-language";

const dictionaries = {
  eng: {
    nav: {
      dashboard: "Dashboard",
      docs: "How it works?",
      linkedin: "LinkedIn",
      toggleTheme: "Toggle dark mode",
      light: "Switch to light mode",
      dark: "Switch to dark mode",
      brand: "Customer Sentiment",
      tagline: "AI feedback intelligence",
    },
    dashboard: {
      eyebrow: "Local AI workspace",
      title: "Turn customer comments into a clear satisfaction signal.",
      subtitle: "Paste WhatsApp messages, Google Maps reviews, or upload a CSV to analyze feedback locally in your browser.",
      privacyTitle: "Your data never leaves this browser.",
      privacyText: "We do not collect emails, store feedback on servers, or send customer comments away from this device. This workflow respects LGPD by design.",
      total: "Feedbacks analyzed",
      satisfaction: "Business health",
      positive: "Positive",
      neutral: "Neutral",
      negative: "Negative",
      formTitle: "Analyze Feedback",
      formText: "Paste multiple messages or import a simple CSV file.",
      label: "Customer feedback",
      placeholder: "Paste WhatsApp messages, Google Maps reviews, or customer feedback here...",
      chars: "characters",
      csv: "Upload CSV",
      restore: "Upload analysis JSON",
      analyze: "Analyze",
      analyzing: "Analyzing...",
      modelIdle: "The AI model loads only when you analyze, keeping the first page load light.",
      modelLoading: "Preparing local AI model. The first run can take a little longer.",
      modelReady: "Local AI model ready. Future runs use the browser cache.",
      modelFallback: "Local AI model was not available, so a lightweight offline fallback was used.",
      success: "Analysis completed locally.",
      emptyInput: "Paste feedback or upload a CSV before analyzing.",
      csvLoaded: "CSV imported successfully.",
      restoreSuccess: "Analysis restored from JSON.",
      restoreError: "Could not restore this JSON file.",
      chartTitle: "Business Health",
      chartText: "Positive vs neutral vs negative feedback from the current local analysis.",
      categoriesTitle: "Automatic Categories",
      categoriesText: "Most common themes detected in the current analysis.",
      historyTitle: "Processed Feedback",
      historyText: "Newest local analysis items appear first.",
      emptyHistory: "No local analysis yet",
      emptyHistoryText: "Paste feedback or upload a CSV to generate the chart and category breakdown.",
      download: "Download ZIP",
      clear: "Clear",
      clearTitle: "Clear local analysis?",
      clearText: "This removes the analysis stored in this browser.",
      cancel: "Cancel",
      clearHistory: "Clear Analysis",
      downloadError: "Could not create the ZIP download.",
      categoryDelivery: "Delivery delays",
      categoryQuality: "Taste or quality issues",
      categoryService: "Customer service praise",
      categoryPrice: "Price complaints",
      categoryCheckout: "Checkout or app issues",
      categoryOther: "Other feedback",
      percent: "of feedbacks",
    },
    docs: {
      back: "Back to dashboard",
      eyebrow: "How it works?",
      title: "A clear guide for reading customer feedback",
      intro: "This app analyzes feedback locally in your browser. You can paste messages, upload CSV files, restore a previous JSON export, and download the results for presentations.",
      steps: [
        ["Paste or upload feedback", "Use WhatsApp messages, Google Maps reviews, plain text, or a simple CSV file."],
        ["Analyze locally", "The browser downloads a compact AI model on first use and reuses its cache later."],
        ["Export your result", "Download the ZIP with a chart image and the JSON data when you finish."],
      ],
      labelsTitle: "What the labels mean",
      positiveText: "The customer sounds satisfied, thankful, or happy with the experience.",
      neutralText: "The comment is mixed, unclear, or does not strongly sound happy or unhappy.",
      negativeText: "The customer sounds frustrated, disappointed, or unhappy with the experience.",
      guideTitle: "Important privacy and persistence notes",
      browserStorage: "The analysis is stored in this browser only. If you clear browser cache or use another device, the history will not be there.",
      recommendation: "Download the ZIP every time you finish an analysis. The PNG is useful for presentations, and the JSON lets you restore the dashboard later.",
      csvTitle: "CSV upload",
      csvText: "CSV files are parsed in the browser with delimiter auto-detection, including comma and semicolon formats.",
      lgpdTitle: "LGPD-first workflow",
      lgpdText: "No customer feedback is stored on a server by this client-side workflow.",
    },
  },
  ptbr: {
    nav: {
      dashboard: "Dashboard",
      docs: "Como funciona?",
      linkedin: "LinkedIn",
      toggleTheme: "Alternar modo escuro",
      light: "Mudar para modo claro",
      dark: "Mudar para modo escuro",
      brand: "Customer Sentiment",
      tagline: "Inteligência de feedback com IA",
    },
    dashboard: {
      eyebrow: "Workspace de IA local",
      title: "Transforme comentários de clientes em um sinal claro de satisfação.",
      subtitle: "Cole mensagens do WhatsApp, avaliações do Google Maps ou envie um CSV para analisar feedbacks localmente no navegador.",
      privacyTitle: "Seus dados não saem daqui.",
      privacyText: "Não coletamos e-mails, não guardamos seus feedbacks em servidores e não enviamos comentários de clientes para fora deste dispositivo. Este fluxo respeita 100% a LGPD.",
      total: "Feedbacks analisados",
      satisfaction: "Saúde do negócio",
      positive: "Positivos",
      neutral: "Neutros",
      negative: "Negativos",
      formTitle: "Analisar Feedbacks",
      formText: "Cole várias mensagens ou importe um CSV simples.",
      label: "Feedback dos clientes",
      placeholder: "Cole mensagens do WhatsApp, avaliações do Google Maps ou feedbacks de clientes aqui...",
      chars: "caracteres",
      csv: "Enviar CSV",
      restore: "Enviar JSON da análise",
      analyze: "Analisar",
      analyzing: "Analisando...",
      modelIdle: "O modelo de IA só carrega ao analisar, mantendo o primeiro acesso leve.",
      modelLoading: "Preparando o modelo local de IA. A primeira execução pode demorar um pouco mais.",
      modelReady: "Modelo local pronto. As próximas execuções usam o cache do navegador.",
      modelFallback: "O modelo local não ficou disponível, então foi usado um fallback offline leve.",
      success: "Análise concluída localmente.",
      emptyInput: "Cole feedbacks ou envie um CSV antes de analisar.",
      csvLoaded: "CSV importado com sucesso.",
      restoreSuccess: "Análise restaurada pelo JSON.",
      restoreError: "Não foi possível restaurar este arquivo JSON.",
      chartTitle: "Saúde do Negócio",
      chartText: "Feedbacks positivos, neutros e negativos da análise local atual.",
      categoriesTitle: "Categorias Automáticas",
      categoriesText: "Temas mais comuns detectados na análise atual.",
      historyTitle: "Feedbacks Processados",
      historyText: "Os itens da análise local aparecem aqui.",
      emptyHistory: "Nenhuma análise local ainda",
      emptyHistoryText: "Cole feedbacks ou envie um CSV para gerar o gráfico e as categorias.",
      download: "Baixar ZIP",
      clear: "Limpar",
      clearTitle: "Limpar análise local?",
      clearText: "Isso remove a análise armazenada neste navegador.",
      cancel: "Cancelar",
      clearHistory: "Limpar Análise",
      downloadError: "Não foi possível criar o ZIP.",
      categoryDelivery: "Atrasos na entrega",
      categoryQuality: "Problemas com sabor/qualidade",
      categoryService: "Elogios ao atendimento",
      categoryPrice: "Reclamações sobre preço",
      categoryCheckout: "Problemas no checkout ou app",
      categoryOther: "Outros feedbacks",
      percent: "dos feedbacks",
    },
    docs: {
      back: "Voltar ao dashboard",
      eyebrow: "Como funciona?",
      title: "Um guia claro para ler feedbacks de clientes",
      intro: "Este app analisa feedbacks localmente no navegador. Você pode colar mensagens, enviar CSV, restaurar uma exportação JSON anterior e baixar os resultados para apresentações.",
      steps: [
        ["Cole ou envie feedbacks", "Use mensagens do WhatsApp, avaliações do Google Maps, texto livre ou um CSV simples."],
        ["Analise localmente", "O navegador baixa um modelo compacto de IA no primeiro uso e reutiliza o cache depois."],
        ["Exporte o resultado", "Baixe o ZIP com a imagem do gráfico e os dados JSON quando terminar."],
      ],
      labelsTitle: "O que os rótulos significam",
      positiveText: "O cliente parece satisfeito, agradecido ou feliz com a experiência.",
      neutralText: "O comentário é misto, pouco claro ou não parece fortemente feliz nem insatisfeito.",
      negativeText: "O cliente parece frustrado, decepcionado ou insatisfeito com a experiência.",
      guideTitle: "Notas importantes sobre privacidade e persistência",
      browserStorage: "A análise fica salva apenas neste navegador. Se você limpar o cache ou usar outro dispositivo, o histórico não estará lá.",
      recommendation: "Baixe o ZIP sempre que terminar uma análise. O PNG serve para apresentações, e o JSON permite restaurar o dashboard depois.",
      csvTitle: "Upload de CSV",
      csvText: "Os CSVs são lidos no navegador com detecção automática de delimitador, incluindo vírgula e ponto e vírgula.",
      lgpdTitle: "Fluxo pensado para LGPD",
      lgpdText: "Nenhum feedback de cliente é armazenado em servidor neste fluxo client-side.",
    },
  },
} as const;

type Dictionary = (typeof dictionaries)[keyof typeof dictionaries];

const I18nContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: Dictionary;
} | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("eng");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ptbr" || saved === "eng") {
      setLanguageState(saved);
      document.documentElement.lang = saved === "ptbr" ? "pt-BR" : "en";
    }
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage === "ptbr" ? "pt-BR" : "en";
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "eng" ? "ptbr" : "eng"),
      t: dictionaries[language],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
