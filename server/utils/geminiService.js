// procedure i followed to use gemini to scan the images.
/*
1. created the api key on aistudio.google.com
2. copied that and pasted in .env
3. installed the sdk npm install @google/generative-ai
4. created the file geminiService.js
5. use this service in the registerPickup controller.
*/
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINIAPIKEY);

export const analyzeWasteImages = async (files) => {
    const model = genAI.getGenerativeModel(
        { model: "gemini-3.5-flash" }
    );

    // build image parts for all files, as gemini does not accepts raw binary it accepts images as base64 strings.
    const imageParts = files.map((file) => ({
        inlineData: {
            data: file.buffer.toString("base64"),
            mimeType: file.mimetype
        }
    }));

    const prompt = `
    You are a waste analysis AI for a recycling platform called Trash2Cash.
    You are given ${files.length} image(s) of the same waste pickup.
        Analyze All images together and respond ONLY in this JSON format, nothing else:
    {
            "wasteType": "plastic | cardboard | paper | e-waste | dry waste | mixed | unknown",
            "estimatedWeightKg": <number between 0.1 and 50>,
            "confidence": "low | medium | high",
            "description": "<one line description of what you see>",
            "isRecyclable": true | false
    }
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();

    // strip markdown code fences if present
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
}

export const compareWasteImages = async (originalImageUrls, inspectorFiles) => {
    // fetch every user original from Cloudinary → inlineData part
    const originalParts = await Promise.all(
        originalImageUrls.map(async (url) => {
            const res = await fetch(url);
            const buffer = Buffer.from(await res.arrayBuffer());
            return {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: "image/jpeg",   // Cloudinary transforms to jpeg by default; adjust if you store png
                },
            };
        })
    );

    // every inspector upload → inlineData part (same shape as analyzeWasteImages)
    const inspectorParts = inspectorFiles.map((file) => ({
        inlineData: {
            data: file.buffer.toString("base64"),
            mimeType: file.mimetype,
        },
    }));

    const prompt = `
You are verifying a waste pickup for Trash2Cash.
You are given ${originalParts.length} image(s) taken by the USER when they requested
the pickup, followed by ${inspectorParts.length} image(s) just taken by the INSPECTOR
at the location.
Compare the two SETS as a whole. Decide whether they show the same waste at plausibly
the same place, allowing for different angle, lighting, and time of day.
Respond ONLY with JSON, no markdown:
{ "match": boolean, "confidence": number (0-100), "reason": string }
`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // label each group with a text part so the model can tell user vs inspector
    const result = await model.generateContent([
        prompt,
        "USER IMAGES:",
        ...originalParts,
        "INSPECTOR IMAGES:",
        ...inspectorParts,
    ]);

    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
};