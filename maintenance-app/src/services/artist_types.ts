export interface Artist {
  id: number;
  name: string;
  origin?: string;
  vita?: string;
  homepageUrl?: string;
  facebookUrl?: string;
  instaUrl?: string;
  artistsImages?: ArtistImage[];
}

export interface ArtistImage {
  id: number;
  artist_id: number;
  orientation: 'portrait' | 'landscape';
  url: string;
  alt: string;
  location?: string;
  coords?: string;
  title?: string;
  imgDate?: Date;
  attribution?: string;
  shortdescription?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  imgType?: string;
}

export interface ApiResponse {
    artists: Artist[];
}