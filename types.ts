
// Fix: Removed import of MimeType as it is not an exported member of '@google/genai'.
// Mime types are represented as strings.

export enum EnhanceMethod {
  SMART = 'Smart',
  CUSTOMIZE = 'Customize',
  REFERENCE = 'Reference',
}

export interface CustomizationOptions {
  theme: string;
  customTheme: string;
  props: string;
  instructions: string;
}

export interface ImageData {
  dataUrl: string;
  // Fix: The mimeType property should be a string.
  mimeType: string;
}

// New Types for Magic Product Refactor
export enum ProductMode {
    PRODUCT_ONLY = 'Produk Saja',
    WITH_MODEL = 'Produk + Model'
}

export enum StyleTheme {
    NATURAL = 'Natural',
    MINIMALIST = 'Minimalist',
    LUXURY = 'Luxury',
    STREET = 'Street Style',
    CINEMATIC = 'Cinematic',
    SURREAL = 'Surreal'
}

export interface UploadedImage {
    base64: string;
    mimeType: string;
    name?: string;
}

export interface ModelGenerationOptions {
  gender: string;
  ethnicity: string;
  customEthnicity?: string;
  details: string;
}

export interface AdCopyOptions {
  headline: string;
  description: string;
  cta: string;
  instructions: string;
}

export interface AdCopySuggestions {
  headlines: string[];
  descriptions: string[];
  ctas: string[];
}

export enum PoseStudioMode {
  SMART = 'Smart',
  CUSTOMIZE = 'Customize',
}

export interface PoseStudioOptions {
  theme: string;
  customTheme: string;
  angle: string;
  framing: string;
  instructions: string;
}

export enum ImageEditorMode {
  RESIZE = 'Resize',
  MAGIC_BRUSH = 'Magic Brush',
}

// POV Studio Types
export enum PovHandStyle {
  AUTO = 'Auto',
  FEMALE = 'Female Hand',
  MALE = 'Male Hand',
  SWEATER = 'Sweater/Long Sleeve'
}

export interface PovStudioOptions {
  handStyle: PovHandStyle;
  backgroundMode: 'preset' | 'custom';
  theme: string; // Key from POV_THEMES
  customTheme: string;
  instructions: string;
}

// Mirror Studio Types
export interface MirrorStudioOptions {
  modelSource: 'generate' | 'upload';
  gender: 'Female' | 'Male';
  ethnicity: string;
  frame: string; // Key from MIRROR_FRAMES
  theme: string; // Key from MIRROR_THEMES
  customTheme: string;
}

// Listing Studio Types
export interface ListingStudioOptions {
  features: string[];
  style: string; // Key from LISTING_STYLES
}

// Perspective Studio Types
export interface PerspectiveStudioOptions {
  theme: string;
  customTheme: string;
  instructions: string;
}

export interface PerspectiveGrid {
  front: ImageData | null;
  back: ImageData | null;
  side: ImageData | null;
  top: ImageData | null;
}

export interface BackgroundChangerOptions {
  mode: 'upload' | 'generate';
  prompt: string; // Used for generate mode
  instructions: string; // Used for additional tweaking in both modes
}

// Magic Product Types (Two-Step Workflow)
export interface MagicProductConcept {
  id: number;
  name: string;   // Indonesian Title
  prompt: string; // English Prompt
}

export interface MagicProductOptions {
  lighting: 'light' | 'dark';
  mood: 'clean' | 'crowd';
  location: 'indoor' | 'outdoor'; // Only if mood is crowd
  ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
}

// Magic B-Roll Types
export interface BrollIdea {
    title: string;
    prompt: string;
}

export interface BrollResult {
    imageUrl: string | null;
    prompt: string;
    title: string;
    status: 'loading' | 'done' | 'error';
    error?: string;
}

// Magic Storyboard Types
export interface StoryboardPanel {
    visual_prompt: string;
    narration: string;
    imageUrl?: string;
}

// Magic Voice Types
export type VoiceQuality = 'standard' | 'pro';

export interface CreativeContext {
    targetAudience: string;
    vibe: string;
    contentType: string;
    dialek?: string;
}

export interface Actor {
    id: string;
    name: string;
    voice: string;
}

export interface ModelVipOptions {
    gender: string;
    ethnicity: string;
    isHijab: boolean;
    hasMakeup: boolean;
    glassesType: string;
    bodyType: string;
    pose: string;
    facialExpression: string;
    handPose: string;
    hasMask: boolean;
    theme: string;
    aspectRatio: string;
    brief?: string;
}

export interface SelfieVipOptions {
    gender: string;
    ethnicity: string;
    isHijab: boolean;
    pose: string;
    faceVisibility: 'obstructed' | 'unobstructed';
    theme: string;
    aspectRatio: string;
}

export type View = 
  | 'home'
  | 'productStudio' 
  | 'virtualTryOn' 
  | 'lifestylePhotoshoot' 
  | 'mergeProduct' 
  | 'digitalImaging' 
  | 'adCreator' 
  | 'povStudio' 
  | 'mirrorStudio' 
  | 'listingStudio' 
  | 'perspectiveStudio' 
  | 'backgroundChanger' 
  | 'videoStudio' 
  | 'magicBRoll' 
  | 'magicGenEditor' 
  | 'magicCarousel' 
  | 'magicFashion' 
  | 'magicFusion' 
  | 'magicModel' 
  | 'magicPose' 
  | 'magicRestore' 
  | 'magicStoryboard' 
  | 'magicVideo' 
  | 'magicVoice'
  | 'mockupGenerator'
  | 'magicPhotoshoot'
  | 'goAesthetic'
  | 'goAestheticV2'
  | 'goKids'
  | 'goFamily'
  | 'goModelVip'
  | 'goModelVipV2'
  | 'goDetail'
  | 'goCermin'
  | 'goClean'
  | 'goSelfieVip';