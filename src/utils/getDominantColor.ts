export default async function getDominantColor(
  base64: string
): Promise<string> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject("Could not create canvas context");
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const colorCount = {} as Record<string, number>;
      let maxCount = 0;
      let dominantColor = "";

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];

        if (alpha < 128) continue; // Ignore transparent pixels

        const rgb = `${r},${g},${b}`;
        colorCount[rgb] = (colorCount[rgb] || 0) + 1;

        if (colorCount[rgb] > maxCount) {
          maxCount = colorCount[rgb];
          dominantColor = rgb;
        }
      }

      resolve(`rgb(${dominantColor})`);
    };
    img.onerror = function (error) {
      reject(error);
    };
    img.src = base64;
  });
}
