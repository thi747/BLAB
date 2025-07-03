// BLAB - Because Light Attracts Bugs
// Conversão Matemática de Cores

(function () {
  "use strict";

  const STYLE_ID = "BLAB";

  // Converter hex para HSL
  function hexToHsl(hex) {
    if (!hex?.match(/^#[0-9a-f]{6}$/i)) return null;

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  // Converter HSL para hex
  function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Converter RGB para hex
  function rgbToHex(rgb) {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return null;

    const toHex = (n) => {
      const hex = parseInt(n).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
  }

  // Escurecer cor de fundo (mantém matiz)
  function darkenBackground(color) {
    let hex = color;
    if (color.includes("rgb")) hex = rgbToHex(color);
    if (!hex || hex === "#000000") return "#1a1a1a";
    if (hex === "#ffffff") return "#2a2a2a";

    const hsl = hexToHsl(hex);
    if (!hsl) return "#2a2a2a";

    let [h, s, l] = hsl;

    // Escurece mas mantém o matiz
    if (l > 80) l = 15; // Muito claro → bem escuro
    else if (l > 60) l = 25; // Claro → escuro
    else if (l > 40) l = 35; // Médio → meio escuro
    else if (l < 20) l = 15; // Já escuro → um pouco mais escuro

    // Aumenta saturação ligeiramente para compensar
    s = Math.min(100, s * 1.1);

    return hslToHex(h, s, l);
  }

  // Clarear cor de texto (mantém matiz)
  function lightenText(color) {
    let hex = color;
    if (color.includes("rgb")) hex = rgbToHex(color);
    if (!hex || hex === "#ffffff") return "#e0e0e0";
    if (hex === "#000000") return "#e0e0e0";

    const hsl = hexToHsl(hex);
    if (!hsl) return "#e0e0e0";

    let [h, s, l] = hsl;

    // Clareia mas mantém o matiz
    if (l < 20) l = 85; // Muito escuro → bem claro
    else if (l < 40) l = 75; // Escuro → claro
    else if (l < 60) l = 65; // Médio → meio claro
    else if (l > 80) l = 85; // Já claro → um pouco mais claro

    // Reduz saturação ligeiramente para suavizar
    s = Math.max(30, s * 0.9);

    return hslToHex(h, s, l);
  }

  // Processar todos os elementos
  function processAllElements() {
    const elements = document.querySelectorAll("*");

    elements.forEach((el) => {
      const computed = getComputedStyle(el);

      // Processar background-color
      const bgColor = computed.backgroundColor;
      if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
        const newBg = darkenBackground(bgColor);
        el.style.setProperty("background-color", newBg, "important");
      }

      // Processar color
      const textColor = computed.color;
      if (textColor && textColor !== "rgba(0, 0, 0, 0)") {
        const newColor = lightenText(textColor);
        el.style.setProperty("color", newColor, "important");
      }

      // Processar border-color
      const borderColor = computed.borderColor;
      if (borderColor && borderColor !== "rgba(0, 0, 0, 0)") {
        const newBorder = darkenBackground(borderColor);
        el.style.setProperty("border-color", newBorder, "important");
      }
    });
  }

  // Processar variáveis CSS
  function processCSSVars() {
    const root = document.documentElement;
    const rootStyles = getComputedStyle(root);

    // Buscar todas as propriedades customizadas
    for (let prop of rootStyles) {
      if (prop.startsWith("--")) {
        const value = rootStyles.getPropertyValue(prop).trim();

        // Se parece com cor hex
        if (/^#[0-9a-f]{6}$/i.exec(value)) {
          const hsl = hexToHsl(value);
          if (hsl) {
            // Se é claro, escurece (background). Se é escuro, clareia (text)
            const newColor = hsl.l > 50 ? darkenBackground(value) : lightenText(value);
            root.style.setProperty(prop, newColor);
          }
        }

        // Se parece com cor rgb
        if (/rgb\(\d+,\s*\d+,\s*\d+\)/.exec(value)) {
          const hex = rgbToHex(value);
          if (hex) {
            const hsl = hexToHsl(hex);
            if (hsl) {
              const newColor = hsl.l > 50 ? darkenBackground(value) : lightenText(value);
              root.style.setProperty(prop, newColor);
            }
          }
        }
      }
    }
  }

  // Aplicar dark mode
  function applyDarkMode() {
    // Remove estilo anterior se existir
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();

    // Aplica estilos básicos
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
            html { background-color: #1a1a1a !important; }
            body { background-color: #1a1a1a !important; }
        `;
    document.head.appendChild(style);

    // Processa elementos e variáveis CSS
    processCSSVars();
    processAllElements();

    console.log(`🌙 ${STYLE_ID} - Dark Mode ativado!`);
  }

  // Aplicar automaticamente
  applyDarkMode();

  // Observer para novos elementos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        setTimeout(() => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              const elements = [node, ...node.querySelectorAll("*")];
              elements.forEach((el) => {
                const computed = getComputedStyle(el);

                const bgColor = computed.backgroundColor;
                if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
                  el.style.setProperty("background-color", darkenBackground(bgColor), "important");
                }

                const textColor = computed.color;
                if (textColor && textColor !== "rgba(0, 0, 0, 0)") {
                  el.style.setProperty("color", lightenText(textColor), "important");
                }
              });
            }
          });
        }, 100);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
