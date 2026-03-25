
import { GoogleGenAI, Modality, Part, Type, GenerateContentResponse } from '@google/genai';
import { getEffectiveApiKey } from '../hooks/useApiKey';
import { 
  ImageData, 
  UploadedImage,
  BrollIdea,
  AdCopyOptions,
  AdCopySuggestions,
  PoseStudioMode,
  PoseStudioOptions,
  PovStudioOptions,
  MirrorStudioOptions,
  ListingStudioOptions,
  PerspectiveStudioOptions,
  PerspectiveGrid,
  BackgroundChangerOptions,
  StyleTheme,
  StoryboardPanel,
  ModelGenerationOptions,
  CustomizationOptions,
  ModelVipOptions,
  SelfieVipOptions
} from '../types';

// Helper: Convert UploadedImage or ImageData to Gemini Part
function toPart(image: UploadedImage | ImageData | null): Part {
    if (!image) return { text: "" };
    
    const base64 = 'base64' in image 
        ? image.base64 
        : (image as any).dataUrl?.split(',')[1];
    
    // Safety check: Gemini API rejects parts with empty or missing data/text
    if (!base64 || base64.trim() === "") {
        return { text: "" };
    }

    return {
        inlineData: {
            data: base64,
            mimeType: image.mimeType || 'image/jpeg',
        },
    };
}

// Helper: Extract image from Gemini response
async function extractImageFromResponse(response: GenerateContentResponse): Promise<string> {
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        
        let textContent = "";
        for (const part of response.candidates[0].content.parts) {
            if (part.text) textContent += part.text + " ";
        }
        
        if (textContent.trim()) {
            const cleanText = textContent.trim().toLowerCase();
            if (cleanText.includes("sorry") || cleanText.includes("cannot") || cleanText.includes("unable")) {
                throw new Error("AI menolak merender visual ini. Coba gunakan deskripsi yang lebih deskriptif.");
            }
            throw new Error("AI memberikan deskripsi teks tapi gagal menghasilkan gambar.");
        }
    }
    throw new Error("Model tidak menghasilkan gambar. Silakan coba lagi.");
}

const PRODUCT_PRESERVATION_PROMPT = "Maintain the EXACT identity, shape, color, and details of the product from the source image. Do not change the product itself, only the environment and lighting around it.";

// =================== Go Product Studio ===================

export const generateGoProductConcepts = async (image: UploadedImage, withModel: boolean, style: StyleTheme) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
            parts: [
                { text: `Analyze this product image and suggest 4 creative studio photoshoot concepts in ${style} style. ${withModel ? "Include a human model in the concepts." : "Focus on product-only concepts."} Respond in JSON format.` },
                toPart(image)
            ]
        }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        prompt: { type: Type.STRING }
                    },
                    required: ["name", "prompt"]
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const generateGoProductImage = async (image: UploadedImage, prompt: string, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `${PRODUCT_PRESERVATION_PROMPT} ${prompt}` }, toPart(image)] }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

export const generateStyloImage = async (prompt: string, modelImage: UploadedImage, productImage: UploadedImage | null, logoImage: UploadedImage | null, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [{ text: `${PRODUCT_PRESERVATION_PROMPT} ${prompt}` }, toPart(modelImage)];
    if (productImage) parts.push(toPart(productImage));
    if (logoImage) parts.push(toPart(logoImage));
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

export const generateProductPhoto = async (image: UploadedImage, prompt: string) => {
    return generateGoProductImage(image, prompt, "1:1");
};

// =================== Go TryOn ===================

export const generateVirtualTryOn = async (product: ImageData, model: ImageData, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{
            parts: [
                { text: `${PRODUCT_PRESERVATION_PROMPT} Synthesize a professional fashion photo where the subject from the second image is wearing the clothing from the first image. Maintain facial features of the model and details of the clothing. High resolution, studio lighting.` },
                toPart(product),
                toPart(model)
            ]
        }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Go Ad Creator ===================

export const generateAdImage = async (product: ImageData, options: AdCopyOptions, reference: ImageData | null) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const prompt = `${PRODUCT_PRESERVATION_PROMPT} Create a commercial advertisement poster. Headline: "${options.headline}". Description: "${options.description}". CTA: "${options.cta}". ${options.instructions}. Professional typography and layout.`;
    const parts: Part[] = [{ text: prompt }, toPart(product)];
    if (reference) parts.push(toPart(reference));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: {
            imageConfig: { aspectRatio: "9:16" },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

export const generateAdCopySuggestions = async (productName: string, keywords: string): Promise<AdCopySuggestions> => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: `Generate 3 variations of advertising copy for "${productName}" with keywords "${keywords}". Provide headlines, descriptions, and CTAs in JSON format.` }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
                    descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    ctas: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["headlines", "descriptions", "ctas"]
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

// =================== Go Pose ===================

export const generateStudioPoses = async (image: ImageData, mode: PoseStudioMode, options: PoseStudioOptions) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const prompt = mode === PoseStudioMode.SMART 
        ? `${PRODUCT_PRESERVATION_PROMPT} Suggest and render a variety of professional catalog poses for this model.`
        : `${PRODUCT_PRESERVATION_PROMPT} Render the model in a ${options.theme} theme, ${options.angle} angle, ${options.framing} framing. ${options.instructions}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }, toPart(image)] }],
        config: {
            imageConfig: { aspectRatio: "3:4" },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

export const changeModelPose = async (image: UploadedImage, pose: string, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `${PRODUCT_PRESERVATION_PROMPT} Change the model's pose to: ${pose}. Keep identity and outfit consistent.` }, toPart(image)] }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Go Editor ===================

export const resizeImage = async (image: ImageData) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: "Outpaint and expand the background of this image to fit the new dimensions naturally." }, toPart(image)] }],
        config: {
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

export const editImageWithMask = async (image: ImageData, prompt: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `${PRODUCT_PRESERVATION_PROMPT} ${prompt}` }, toPart(image)] }],
        config: {
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

export const editImage = async (original: UploadedImage, mask: UploadedImage, prompt: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ 
            parts: [
                { text: `${PRODUCT_PRESERVATION_PROMPT} ${prompt}` }, 
                toPart(original),
                { text: "This is the area to edit indicated by the mask:" },
                toPart(mask)
            ] 
        }],
        config: {
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Video Studio ===================

export const generateVideo = async (prompt: string, image: ImageData) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: image.dataUrl.split(',')[1],
            mimeType: image.mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    return operation.response?.generatedVideos?.[0]?.video?.uri;
};

export const suggestMotionPrompt = async (image: ImageData) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: "Suggest a single cinematic motion prompt for this image to be used in a video generator. Describe camera movement and subtle animation." }, toPart(image)] }]
    });
    return response.text || "";
};

// =================== Go Motion Prompt ===================

export const generateMotionPrompt = async (image: ImageData, keywords: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
            parts: [
                { text: `Generate 3 detailed T2V motion prompts based on this image and keywords: ${keywords}. Focus on professional cinematography.` }, 
                toPart(image)
            ] 
        }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    prompts: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["prompts"]
            }
        }
    });
    const data = JSON.parse(response.text || '{"prompts":[]}');
    return { prompts: data.prompts };
};

// =================== Go Merge ===================

export const generateMergePrompt = async (images: UploadedImage[], existingPrompt: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [
        { text: `Create a cohesive scene prompt to merge these items: ${existingPrompt}. Describe how they should be arranged and illuminated in a single scene.` },
        ...images.map(img => toPart(img))
    ];
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts }]
    });
    return response.text || "";
};

export const generateMergedImage = async (images: UploadedImage[], prompt: string, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [{ text: `${PRODUCT_PRESERVATION_PROMPT} ${prompt}` }, ...images.map(img => toPart(img))];
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    const imageUrl = await extractImageFromResponse(response);
    return imageUrl.split(',')[1];
};

// =================== Go Lifestyle ===================

export const generateLifestylePhotoshoot = async (product: ImageData, model: ImageData | null, genParams: ModelGenerationOptions | null, interaction: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    // Fix: Constructed finalized prompt before creating parts to ensure all details are included in the generation request.
    let prompt = `${PRODUCT_PRESERVATION_PROMPT} Create a realistic lifestyle photoshoot. ${interaction}. High quality photography.`;
    if (genParams) {
        prompt += ` Featuring a ${genParams.gender} model, ${genParams.ethnicity} ethnicity. ${genParams.details}`;
    }

    const parts: Part[] = [{ text: prompt }, toPart(product)];
    if (model) parts.push(toPart(model));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: {
            imageConfig: { aspectRatio: "3:4" },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

// =================== Go Digital Imaging ===================

export const generateDigitalImaging = async (image: ImageData, options: CustomizationOptions) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const prompt = `${PRODUCT_PRESERVATION_PROMPT} Digital imaging artwork. Theme: ${options.theme}. Props: ${options.props}. Instructions: ${options.instructions}. Creative and artistic.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }, toPart(image)] }],
        config: { responseModalities: [Modality.IMAGE] }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

export const generateDigitalImagingConcepts = async (image: ImageData) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: "Suggest 3 unique digital imaging art concepts for this product." }, toPart(image)] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    concepts: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["concepts"]
            }
        }
    });
    return JSON.parse(response.text || '{"concepts":[]}');
};

export const generateDigitalImagingFromConcept = async (image: ImageData, concept: string) => {
    return generateDigitalImaging(image, { theme: concept, props: "", customTheme: "", instructions: "" });
};

// =================== Go Mirror Selfie ===================

export const generateMirrorSelfie = async (product: ImageData, options: MirrorStudioOptions, model: ImageData | null) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    // Fix: Construct finalized prompt before parts initialization.
    let prompt = `${PRODUCT_PRESERVATION_PROMPT} Mirror selfie photography. Pose: ${options.frame}. Location: ${options.theme}.`;
    if (!(options.modelSource === 'upload' && model)) {
        prompt += ` Featuring a ${options.gender} model, ${options.ethnicity} ethnicity.`;
    }

    const parts: Part[] = [{ text: prompt }, toPart(product)];
    if (options.modelSource === 'upload' && model) {
        parts.push(toPart(model));
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: { responseModalities: [Modality.IMAGE] }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

// =================== Go Listing ===================

export const generateListingImage = async (product: ImageData, options: ListingStudioOptions) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const prompt = `${PRODUCT_PRESERVATION_PROMPT} Product listing infographic. Style: ${options.style}. Features: ${options.features.join(", ")}. Clear typography, clean layout for e-commerce.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }, toPart(product)] }],
        config: { responseModalities: [Modality.IMAGE] }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

// =================== Go Perspective ===================

export const generatePerspectiveSet = async (grid: PerspectiveGrid, options: PerspectiveStudioOptions) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const results: Record<string, string | null> = { front: null, back: null, side: null, top: null };
    const prompt = `${PRODUCT_PRESERVATION_PROMPT} Uniform product photography. Theme: ${options.theme}. ${options.instructions}. Clean consistent background.`;

    for (const key of Object.keys(grid) as (keyof PerspectiveGrid)[]) {
        const image = grid[key];
        if (!image) continue;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ parts: [{ text: prompt }, toPart(image)] }],
            config: { responseModalities: [Modality.IMAGE] }
        });
        results[key] = await extractImageFromResponse(response);
    }
    return results;
};

// =================== Go Background ===================

export const generateBackgroundChange = async (product: ImageData, background: ImageData | null, options: BackgroundChangerOptions) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    let prompt = options.mode === 'generate' ? options.prompt : "Place the product into the provided background image.";
    prompt = `${PRODUCT_PRESERVATION_PROMPT} ${prompt} ${options.instructions}. Realistic blending and shadows.`;
    const parts: Part[] = [{ text: prompt }, toPart(product)];
    if (background) parts.push(toPart(background));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: { responseModalities: [Modality.IMAGE] }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

export const removeBackground = async (image: ImageData) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: "Remove the background and return only the product on a transparent-ready plain white background." }, toPart(image)] }],
        config: { responseModalities: [Modality.IMAGE] }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

// =================== Go B-Roll ===================

export const generateBrollIdeas = async (products: UploadedImage[], description: string, model: UploadedImage | null, theme: string, aspectRatio: string): Promise<BrollIdea[]> => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [
        { text: `Create 6 cinematic B-roll concepts for: ${description}. Theme: ${theme}. Format: ${aspectRatio}. Respond in JSON.` },
        ...products.map(img => toPart(img))
    ];
    if (model) parts.push(toPart(model));

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        prompt: { type: Type.STRING }
                    },
                    required: ["title", "prompt"]
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const generateBrollImageFromIdea = async (ideaPrompt: string, products: UploadedImage[], model: UploadedImage | null, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [{ text: `${PRODUCT_PRESERVATION_PROMPT} ${ideaPrompt}` }, ...products.map(img => toPart(img))];
    if (model) parts.push(toPart(model));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

export const generateBrollDescription = async (products: UploadedImage[], model: UploadedImage | null) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [{ text: "Analyze these product photos and write a concise commercial description." }, ...products.map(img => toPart(img))];
    if (model) parts.push(toPart(model));

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts }]
    });
    return response.text || "";
};

export const generateBrollCaption = async (image: UploadedImage, description: string, title: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: `Write an engaging social media caption for this shot: ${title}. Based on product: ${description}.` }, toPart(image)] }]
    });
    return response.text || "";
};

export const generateBrollVideoPrompt = async (image: UploadedImage, description: string, title: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: `Create a technical T2V prompt for this scene: ${title}. Based on product: ${description}. Focus on camera motion.` }, toPart(image)] }]
    });
    return response.text || "";
};

// =================== Go Carousel ===================

export const generateCarouselDetails = async (image: UploadedImage) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: "Identify this product and write a very short name and 1-sentence description in Indonesian. JSON format." }, toPart(image)] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    productName: { type: Type.STRING },
                    shortDescription: { type: Type.STRING }
                },
                required: ["productName", "shortDescription"]
            }
        }
    });
    return JSON.parse(response.text || '{"productName":"", "shortDescription":""}');
};

export const generateCarouselScript = async (name: string, desc: string, type: string, slides: number) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: `Create a ${slides}-slide carousel script for "${name}" (${desc}). Style: ${type}. Short Indonesian text for each slide. JSON list.` }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    slides: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["slides"]
            }
        }
    });
    const data = JSON.parse(response.text || '{"slides":[]}');
    return data.slides;
};

export const generateCarouselSlide = async (image: UploadedImage, index: number, style: string, aspectRatio: string, withText: boolean) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `${PRODUCT_PRESERVATION_PROMPT} Generate slide ${index} for a carousel. Style: ${style}. Professional presentation.` }, toPart(image)] }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Go Model ===================

export const generateModelImages = async (blueprintJson: string, aspectRatio: string, count: number) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: blueprintJson }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

// =================== Go Restore ===================

export const enhanceImage = async (image: ImageData, prompt: string, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `${PRODUCT_PRESERVATION_PROMPT} ${prompt}` }, toPart(image)] }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Go Storyboard ===================

export const generateStoryboardScenes = async (script: string, reference: UploadedImage | null): Promise<StoryboardPanel[]> => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [{ text: `Break down this script into 4 visual scenes for a storyboard. Return visual_prompt and narration for each. Script: ${script}. JSON format.` }];
    if (reference) parts.push(toPart(reference));

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        visual_prompt: { type: Type.STRING },
                        narration: { type: Type.STRING }
                    },
                    required: ["visual_prompt", "narration"]
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const visualizeStoryboardScene = async (panel: StoryboardPanel, aspectRatio: string, index: number, reference: UploadedImage | null, prevImage: UploadedImage | null) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [{ text: `${PRODUCT_PRESERVATION_PROMPT} Visualize scene ${index + 1}: ${panel.visual_prompt}` }];
    if (reference) parts.push(toPart(reference));
    if (prevImage) {
        parts.push({ text: "Maintain consistency from this previous scene:" });
        parts.push(toPart(prevImage));
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

export const suggestNextStoryboardScenes = async (lastScene: { visual_prompt: string; narration: string; imageUrl: string }, reference: UploadedImage | null): Promise<StoryboardPanel[]> => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const parts: Part[] = [
        { text: `Based on the last scene "${lastScene.narration}", suggest 4 possible next scenes. Return visual_prompt and narration for each in JSON.` },
        { inlineData: { data: lastScene.imageUrl.split(',')[1], mimeType: 'image/png' } }
    ];
    if (reference) parts.push(toPart(reference));

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        visual_prompt: { type: Type.STRING },
                        narration: { type: Type.STRING }
                    },
                    required: ["visual_prompt", "narration"]
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const generateVideoAIPrompt = async (panels: StoryboardPanel | StoryboardPanel[]) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const text = Array.isArray(panels) ? panels.map(p => p.narration).join(". ") : panels.narration;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: `Convert this storyboard sequence into a single technical video generation prompt: ${text}` }]
    });
    return response.text || "";
};

// =================== Go Video Generator ===================

export const enhanceVideoPrompt = async (inspiration: UploadedImage, basicIdea: string, includeDialog: boolean, dialogText: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const prompt = `Create a master technical T2V prompt. Idea: ${basicIdea}. ${includeDialog ? "Include lip-sync dialogue: " + dialogText : ""}. Reference the inspiration image for style and subject. One dense line.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }, toPart(inspiration)] }]
    });
    return response.text || "";
};

// =================== Go Mockup ===================

export const generateMockupImage = async (design: UploadedImage, target: UploadedImage | string, instructions: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    // Fix: Changed const to let for prompt reassignment and ensured finalizing it before creating the parts array.
    let prompt = `${PRODUCT_PRESERVATION_PROMPT} Apply this design onto the mockup object. ${instructions}. Maintain texture and lighting.`;
    if (typeof target === 'string') {
        prompt += ` Target: ${target}`;
    }

    const parts: Part[] = [{ text: prompt }, toPart(design)];
    if (typeof target !== 'string') {
        parts.push(toPart(target));
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: { responseModalities: [Modality.IMAGE] }
    });
    return { imageUrls: [await extractImageFromResponse(response)] };
};

export const generateSetupImage = async (product: UploadedImage, background: UploadedImage, prompt: string, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ 
            parts: [
                { text: `${PRODUCT_PRESERVATION_PROMPT} ${prompt}` }, 
                toPart(product),
                { text: "Background reference:" },
                toPart(background)
            ] 
        }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Go Photoshoot ===================

export const generateSinglePhotoshootImage = async (source: UploadedImage, fullPrompt: string, negativePrompt: string, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    // Strong instruction to maintain product identity
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `${PRODUCT_PRESERVATION_PROMPT} ${fullPrompt}. Negative: ${negativePrompt}` }, toPart(source)] }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Go Voice Studio ===================

export const generateVoiceover = async (text: string, voiceName: string, speed: string, pitch: string, mood?: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `${mood ? mood + ": " : ""}${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Gagal merender audio.");
    return { base64Audio, sampleRate: 24000 };
};

export const generateVoiceSample = async (voiceName: string) => {
    return generateVoiceover("Ini adalah contoh suara saya untuk pratinjau Anda.", voiceName, "Normal", "Normal");
};

export const generateAIScript = async (type: string, tone: string, topic: string, includeTags: boolean) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const prompt = `Write a high-converting advertisement script in Indonesian. Type: ${type}. Tone: ${tone}. Topic: ${topic}. ${includeTags ? "Include emotion tags like [semangat], [lembut], [tegas] in the text." : ""}`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: prompt }]
    });
    return response.text || "";
};

export const translateScript = async (script: string, lang: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: `Translate this script into ${lang} while maintaining emotion tags: ${script}` }]
    });
    return response.text || "";
};

export const analyzeAndTagScript = async (script: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: `Analyze the emotions in this script and insert [tag] indicators for a voice narrator: ${script}` }]
    });
    return response.text || "";
};

// =================== Go Kids & Family ===================

export const generateKidsPhotoshoot = async (
    productImage: UploadedImage,
    productType: string,
    ethnicityPrompt: string,
    themePrompt: string,
    genderPrompt: string,
    posePrompt: string,
    aspectRatio: string = "1:1"
): Promise<{ imageUrl: string }> => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    const prompt = `${PRODUCT_PRESERVATION_PROMPT} Execute a high-fidelity photoshoot featuring an elementary school-age model (around 7-12 years old). Subject: One ${genderPrompt} child model, ${ethnicityPrompt} ethnic appearance. Pose: ${posePrompt}. Model wearing EXACT ${productType} from image. Theme: ${themePrompt}. Professional commercial aesthetic.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }, toPart(productImage)] }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

export const generateFamilyPhotoshoot = async (images: { father: UploadedImage | null, mother: UploadedImage | null, son: UploadedImage | null, daughter: UploadedImage | null }, mode: string, theme: string, aspectRatio: string, isHijab: boolean, ethnicity: string) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    let prompt = `${PRODUCT_PRESERVATION_PROMPT} Family photoshoot at ${theme}. Mode: ${mode}. Ethnicity: ${ethnicity}. ${isHijab ? "The mother and daughter are wearing hijab." : ""} Each person wearing their respective clothing from input images.`;
    const parts: Part[] = [{ text: prompt }];
    if (images.father) parts.push(toPart(images.father));
    if (images.mother) parts.push(toPart(images.mother));
    if (images.son) parts.push(toPart(images.son));
    if (images.daughter) parts.push(toPart(images.daughter));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts }],
        config: {
            imageConfig: { aspectRatio: aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Go Model VIP ===================

export const generateModelVipPhotoshoot = async (product: UploadedImage, options: ModelVipOptions) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    
    let subjectDesc = `a professional ${options.gender} fashion model with a ${options.bodyType} body, ${options.ethnicity} ethnicity, ${options.facialExpression}.`;
    if (options.isHijab) subjectDesc += " The model is wearing a clean aesthetic hijab.";
    if (options.hasMakeup) subjectDesc += " wearing professional studio makeup.";
    if (options.hasMask) subjectDesc += " wearing a plain white non-medical face mask.";
    
    if (options.glassesType === 'sunglasses') {
        subjectDesc += " wearing stylish high-end sunglasses.";
    } else if (options.glassesType === 'reading') {
        subjectDesc += " wearing elegant reading glasses.";
    }
    
    let themeDesc = options.theme;
    if (options.theme === 'aestheticVip') {
        themeDesc = "soft grey fur carpet in a modern minimalist room with monochrome art posters and ambient teal LED lighting, elegant purple accents, professional photography, high-key lighting";
    }

    const prompt = `${PRODUCT_PRESERVATION_PROMPT} FASHION PORTRAIT: ${subjectDesc} The model is wearing the EXACT clothing item from the input image. Main Pose: ${options.pose}. Hand gesture: ${options.handPose}. Background: ${themeDesc}. ${options.brief ? "Additional Instructions: " + options.brief + "." : ""} High fidelity textures, cinematic lighting, 8k resolution, commercial aesthetic. No text, no watermark.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }, toPart(product)] }],
        config: {
            imageConfig: { aspectRatio: options.aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};

// =================== Go Selfie VIP ===================

export const generateSelfieVipPhotoshoot = async (product: UploadedImage, options: SelfieVipOptions) => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });

    let subjectDesc = `A beautiful, photorealistic ${options.gender} model, ${options.ethnicity} ethnicity.`;
    if (options.isHijab) subjectDesc += " The model is wearing a stylish, modern hijab.";

    const faceVisibilityAction = options.faceVisibility === 'obstructed'
        ? "holding a modern smartphone that partially covers their face while taking a mirror selfie. The phone is clearly visible in their hand in the reflection."
        : "holding a modern smartphone to the side, taking a mirror selfie with their full face visible in the reflection. The phone is clearly visible in their hand.";

    const prompt = `${PRODUCT_PRESERVATION_PROMPT} FASHION MIRROR SELFIE: An ultra-realistic, high-end photograph of ${subjectDesc}.
    The model is wearing the EXACT clothing item from the input image.
    ACTION: The model is ${options.pose}, ${faceVisibilityAction}
    BACKGROUND: ${options.theme}.
    STYLE: Photorealistic, cinematic lighting, looks like it was taken with a high-end smartphone, 8k resolution, commercial fashion aesthetic.
    NEGATIVE: No text, no watermarks, no unnatural skin smoothing, no distorted reflections, no extra limbs, do not show the back of the phone, show the phone screen in the mirror reflection.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }, toPart(product)] }],
        config: {
            imageConfig: { aspectRatio: options.aspectRatio as any },
            responseModalities: [Modality.IMAGE]
        }
    });
    return { imageUrl: await extractImageFromResponse(response) };
};


// =================== Go Clean ===================

export const generateCleanImage = async (
    image: UploadedImage, 
    productType: string
): Promise<{ imageUrl: string }> => {
    const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
    
    const prompt = `Act as an expert e-commerce image editor. Your task is to transform this photo of a product being worn by a model into a clean, product-only 'ghost mannequin' or 'flat lay' style image.

**CRITICAL INSTRUCTIONS:**
1.  **Identify the Product:** The main product to isolate is the '${productType}'.
2.  **Remove the Model:** You MUST completely remove the human model. This includes the head, torso, arms, hands, legs, and any visible skin or body parts.
3.  **Remove the Background:** Erase the entire original background, including walls, floors, and any other objects.
4.  **Final Output:** The output MUST be ONLY the '${productType}' product, presented as if it's on a ghost mannequin or laid flat, against a perfectly solid, clean white background (#FFFFFF).
5.  **Preserve Product Shape:** Reconstruct any parts of the product that might be obscured by the model (like the inside of a collar), but maintain the product's original shape and details.

Do not include any part of the human model in the final image. The result should be a professional, catalog-ready product shot on a pure white background.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }, toPart(image)] }],
        config: {
            imageConfig: { aspectRatio: "1:1" as any },
            responseModalities: [Modality.IMAGE]
        }
    });

    return { imageUrl: await extractImageFromResponse(response) };
};

// Generic generateContent
export const generateContent = async (prompt: string, images: UploadedImage[], config: any = {}) => {
  const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
  const parts: Part[] = [
    { text: prompt },
    ...images.map(img => toPart(img))
  ];
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts }],
    ...config
  });
  return response.text;
};

// Generic generateImage
export const generateImage = async (prompt: string, image?: UploadedImage, aspectRatio: string = "1:1") => {
  const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
  const parts: Part[] = [{ text: prompt }];
  if (image) parts.push(toPart(image));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts }],
    config: {
        imageConfig: { aspectRatio: aspectRatio as any },
        responseModalities: [Modality.IMAGE]
    }
  });
  const imageUrl = await extractImageFromResponse(response);
  return { imageUrl };
};