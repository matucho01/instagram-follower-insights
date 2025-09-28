import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Instagram Follower Insights",
    short_name: "IG Insights",
    description:
      "Analiza, compara y limpia tus seguidores de Instagram sin salir del navegador.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0c18",
    theme_color: "#10b981",
    lang: "es",
    dir: "ltr",
    orientation: "portrait",
    categories: ["productivity", "analytics"],
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Cargar exportación",
        short_name: "Analizar",
        description: "Abre el selector para subir tu ZIP o JSON de Instagram",
        url: "/?action=upload",
        icons: [
          {
            src: "/icon.png",
            sizes: "any",
            type: "image/png",
          },
        ],
      },
      {
        name: "Ver comparador",
        short_name: "Comparar",
        description: "Ir directo al comparador de snapshots",
        url: "/?view=compare",
        icons: [
          {
            src: "/icon.png",
            sizes: "any",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
