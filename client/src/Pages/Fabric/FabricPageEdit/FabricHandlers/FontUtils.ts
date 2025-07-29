// Updated font list with common fonts added at the beginning
export const fontFamilyOptions = [
  { label: "Arial", value: "Arial" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Calibri", value: "Calibri" },
  { label: "Helvetica", value: "Helvetica" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
  { label: "Courier New", value: "Courier New" },
  { label: "Tahoma", value: "Tahoma" },
  { label: "Trebuchet MS", value: "Trebuchet MS" },
  { label: "Oswald", value: "Oswald" },
  { label: "Bebas Neue", value: "Bebas Neue" },
  { label: "Anton", value: "Anton" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Lobster", value: "Lobster" },
  { label: "Pacifico", value: "Pacifico" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Abril Fatface", value: "Abril Fatface" },
  { label: "Bangers", value: "Bangers" },
  { label: "Fredoka One", value: "Fredoka One" },
  { label: "Raleway", value: "Raleway" },
  { label: "Archivo Black", value: "Archivo Black" },
  { label: "Luckiest Guy", value: "Luckiest Guy" },
  { label: "Dancing Script", value: "Dancing Script" },
  { label: "Permanent Marker", value: "Permanent Marker" },
  { label: "Rubik", value: "Rubik" },
  { label: "Josefin Sans", value: "Josefin Sans" },
  { label: "Merriweather", value: "Merriweather" },
  { label: "Poppins", value: "Poppins" },
  { label: "Exo 2", value: "Exo 2" },
].sort((a, b) => a.label.localeCompare(b.label));

// Function to inject/update a single <link> for all Google Fonts
// export const loadFonts = async () => {
//   try {
//     const linkId = "dynamic-google-fonts";
//     const href =
//       "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Anton&family=Archivo+Black&family=Bangers&family=Dancing+Script:wght@400..700&family=Exo+2:ital,wght@0,100..900;1,100..900&family=Fredoka:wght@300..700&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Limelight&family=Lobster&family=Luckiest+Guy&family=Merienda:wght@300..900&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Monoton&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&family=Pacifico&family=Permanent+Marker&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Rubik:ital,wght@0,300..900;1,300..900&family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap";
//     let link = document.getElementById(linkId) as HTMLLinkElement | null;
//     if (!link) {
//       link = document.createElement("link") as HTMLLinkElement;
//       link.id = linkId;
//       link.rel = "stylesheet";
//       link.href = href;
//       document.head.appendChild(link);
//     }
//     // Optionally, wait for all fonts to be loaded
//     // (You can add document.fonts.load logic here if needed)
//     // Force canvas to refresh if there's an active text object
//     return true;
//   } catch (error) {
//     console.error("Error loading fonts:", error);
//     return false;
//   }
// };

// Function to inject/update a <style> tag with @import for all Google Fonts
export const loadFonts = async () => {
  try {
    const styleId = "dynamic-google-fonts-import";
    const importUrl =
      "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Anton&family=Archivo+Black&family=Bangers&family=Dancing+Script:wght@400..700&family=Exo+2:ital,wght@0,100..900;1,100..900&family=Fredoka:wght@300..700&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Limelight&family=Lobster&family=Luckiest+Guy&family=Merienda:wght@300..900&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Monoton&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&family=Pacifico&family=Permanent+Marker&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Rubik:ital,wght@0,300..900;1,300..900&family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `@import url('${importUrl}');`;
      document.head.appendChild(style);
    }
    // Optionally, wait for all fonts to be loaded
    // (You can add document.fonts.load logic here if needed)
    // Force canvas to refresh if there's an active text object
    return true;
  } catch (error) {
    console.error("Error loading fonts:", error);
    return false;
  }
};
