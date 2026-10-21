// La taille d'un titre suit sa longueur : un mot reste monumental, une phrase reste lisible.
export function pageTitleSize(title: string) {
  if (title.length <= 24) return "max-w-4xl text-[clamp(2.4rem,7vw,5.6rem)] leading-[0.94]";
  if (title.length <= 48) return "max-w-4xl text-[clamp(2.1rem,5.2vw,4.4rem)] leading-[0.98]";
  return "max-w-5xl text-[clamp(1.8rem,3.8vw,3.4rem)] leading-[1.05]";
}

export function sectionTitleSize(title: string) {
  if (title.length <= 24) return "text-[clamp(2rem,4.6vw,4.2rem)] leading-[0.95]";
  if (title.length <= 48) return "max-w-4xl text-[clamp(1.8rem,3.6vw,3.2rem)] leading-[1.02]";
  return "max-w-4xl text-[clamp(1.6rem,2.8vw,2.5rem)] leading-[1.1]";
}
