const sharp = require("sharp");
const path = require("path");

async function gerarFavicon() {
  const origem = path.join(__dirname, "public", "assets", "Daniel - Caricatura.png");
  const destino256 = path.join(__dirname, "public", "favicon.png");
  const destino32 = path.join(__dirname, "public", "favicon-32.png");

  const tamanho = 256;

  const metadata = await sharp(origem).metadata();
  const lado = Math.min(metadata.width, metadata.height);
  const left = Math.floor((metadata.width - lado) / 2);
  const top = Math.floor((metadata.height - lado) / 2);

  const mascara = Buffer.from(
    "<svg><circle cx=\"" + tamanho / 2 + "\" cy=\"" + tamanho / 2 + "\" r=\"" + tamanho / 2 + "\" /></svg>"
  );

  const imagemRedonda = await sharp(origem)
    .extract({ left: left, top: top, width: lado, height: lado })
    .resize(tamanho, tamanho, { fit: "cover", position: "centre" })
    .composite([{ input: mascara, blend: "dest-in" }])
    .png()
    .toBuffer();

  await sharp(imagemRedonda).toFile(destino256);
  await sharp(imagemRedonda).resize(32, 32).toFile(destino32);

  console.log("Favicon redondo e centralizado gerado com sucesso!");
}

gerarFavicon().catch((err) => {
  console.error("Erro ao gerar favicon:", err);
});