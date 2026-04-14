export default function normalizeContentBlocks(raw: any[]): any[] {
  return raw.map((block) => {
    const id = block._id || block.id || Math.random().toString(36).slice(2, 9);

    if (block.type === "ul" || block.type === "ol") {
      const items = (block.items || []).map((item: any) => {
        // ✅ ALWAYS object return karo
        if (typeof item === "string") {
          return { text: item };
        }

        if (typeof item === "object" && item !== null) {
          return {
            text: item.text || "",
            bold: item.bold || "",
          };
        }

        return { text: "" };
      });

      return {
        _id: id,
        type: block.type,
        items: items.length ? items : [{ text: "" }],
      };
    }

    return {
      _id: id,
      type: block.type,
      text: typeof block.text === "string" ? block.text : "",
    };
  });
}