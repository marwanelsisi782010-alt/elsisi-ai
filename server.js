import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  const { message } = req.body ?? {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "اكتب رسالتك أولاً." });
  }

  // This starter needs a compatible AI API to generate real AI answers.
  // Keep any API key on the server; never place it in public/app.js.
  if (!process.env.AI_API_KEY || !process.env.AI_BASE_URL || !process.env.AI_MODEL) {
    return res.status(503).json({
      error: "الموقع لم يتم ربطه بخدمة ذكاء اصطناعي بعد. الواجهة جاهزة للتجربة."
    });
  }

  try {
    const response = await fetch(`${process.env.AI_BASE_URL.replace(/\\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages: [{ role: "user", content: message }]
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: "تعذر الحصول على رد من خدمة الذكاء الاصطناعي." });
    res.json({ reply: data.choices?.[0]?.message?.content ?? "لم يصل رد." });
  } catch {
    res.status(500).json({ error: "حدث خطأ في الاتصال." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Elsisi's AI running on port ${port}`));
