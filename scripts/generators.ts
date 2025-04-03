import fs from "fs";
import puppeteer, { MediaType } from "puppeteer";
import { pdfRenderOptions, render } from "..";
import resumeJson from "../resume.json";

const asyncStreamWrite = (path: string, content: string) => {
  const stream = fs.createWriteStream(path);

  return new Promise((resolve, reject) => {
    stream.write(content, function (error) {
      if (error) {
        reject(error);
      }
      stream.close(resolve);
    });
  });
};

export const generateHtml = async (path: string) => {
  const html = render(resumeJson);
  await asyncStreamWrite(path, html);

  return html;
};

export const generatePdf = async (path: string) => {
  const html = render(resumeJson);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType(pdfRenderOptions.mediaType as MediaType);
  const pdf = await page.pdf({
    path,
    format: "Letter",
    printBackground: true,
    margin: pdfRenderOptions.margin,
  });
  await browser.close();

  return pdf;
};
