import { GoogleGenAI } from "@google/genai";
import { FoodContent } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI API KEY is not set!");
}

const ai = new GoogleGenAI({ apiKey });

export async function generateFoodContent(dish: string): Promise<FoodContent> {
  const prompt = `
أنت خبير تصوير طعام ومدير سوشيال ميديا لمطعم وكافيه "ZAKAWA" الراقي.

بناءً على الطبق التالي: "${dish}"

قم بإنشاء محتوى احترافي باللغة العربية يحتوي على:

1. **caption**: تعليق جذاب واحترافي للإنستقرام (باللغة العربية، 80-150 كلمة، مع إيموجي مناسب)
2. **hashtags**: 8 وسوم شائعة ومتعلقة بالطعام الفاخر (بدون # في النص)
3. **photographyTips**: 3 نصائح احترافية لتصوير هذا الطبق (باللغة العربية)
4. **mood**: الحالة المزاجية العامة للطبق (مثل: "أنيق ودافئ"، "منعش وحيوي")

أعد النتيجة بصيغة JSON صالحة فقط بدون أي نص إضافي.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const rawText = response.text.trim();
    const jsonStr = rawText.replace(/^```(?:json)?\s*|\s*```$/g, "");
    
    const parsed = JSON.parse(jsonStr) as FoodContent;
    
    if (!parsed.caption || !parsed.hashtags || !parsed.photographyTips || !parsed.mood) {
      throw new Error("استجابة غير مكتملة من الذكاء الاصطناعي");
    }
    
    return parsed;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("فشل في توليد المحتوى. تأكد من صحة مفتاح API وحاول مرة أخرى.");
  }
}