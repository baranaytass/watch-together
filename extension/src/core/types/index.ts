export interface VideoProvider {
  domain: string;
  name: string;
  selector: string; // Video element seçici
}

export const SUPPORTED_PROVIDERS: VideoProvider[] = [
  {
    domain: "youtube.com",
    name: "YouTube",
    selector: "video.html5-main-video"
  },
  {
    domain: "vimeo.com",
    name: "Vimeo",
    selector: "video"
  }
]; 