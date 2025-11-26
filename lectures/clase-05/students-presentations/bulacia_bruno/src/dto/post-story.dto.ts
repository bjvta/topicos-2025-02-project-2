export type PostStoryDto = {
  media: string | null | undefined; // URL local de la imagen o null
  caption: string;
  exclude_contacts: string[];
};
