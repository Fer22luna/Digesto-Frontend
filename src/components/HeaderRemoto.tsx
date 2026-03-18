import { useEffect, useRef } from "react";

let headerScriptLoaded = false;

const HeaderRemoto = () => {
  const headerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar el CSS solo una vez
    if (!document.querySelector('link[href="/remote-header/header.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/remote-header/header.css";
      document.head.appendChild(link);
    }

    // Cargar el HTML del header
    fetch("/remote-header/index.html")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch header");
        return response.text();
      })
      .then((html) => {
        if (!headerContainerRef.current) return;

        headerContainerRef.current.innerHTML = html;

        // Reemplazar rutas relativas de imágenes
        headerContainerRef.current.querySelectorAll("img").forEach((img) => {
          const src = img.getAttribute("src");
          if (src && !src.startsWith("http") && !src.startsWith("/")) {
            img.src = "/remote-header/" + src;
          }
        });

        // Cargar el JS solo una vez globalmente
        if (!headerScriptLoaded) {
          const script = document.createElement("script");
          script.src = "/remote-header/header.js";
          script.async = true;
          document.body.appendChild(script);
          headerScriptLoaded = true;
        }
      })
      .catch((error) => console.error("Error loading remote header:", error));

    return () => {
      if (headerContainerRef.current) {
        headerContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={headerContainerRef} />;
};

export default HeaderRemoto;