import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Kija Açaí - Delivery de Açaí Artesanal",
  description = "O melhor açaí artesanal da cidade. Peça já o seu e receba em casa!",
  keywords = "açaí, delivery, artesanal, saudável, vitamina, smoothie, sobremesa",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url = window.location.href,
  type = "website"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    };

    // Standard meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);

    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', type, true);

    // Twitter tags
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    updateMeta('twitter:card', 'summary_large_image');

    // JSON-LD structured data for local business
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": "Kija Açaí",
      "description": description,
      "url": url,
      "image": image,
      "servesCuisine": "Brazilian",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BR"
      }
    };

    let jsonLdScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(jsonLd);

  }, [title, description, keywords, image, url, type]);

  return null;
};

export default SEOHead;