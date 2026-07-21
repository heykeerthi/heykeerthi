// pdfkit.js — minimal PDF writer: N JPEG pages at a fixed page size.
// imagesToPdf(jpegDataUrls, imgWpx, imgHpx, pageWpt, pageHpt) -> Blob

function dataUrlBytes(dataUrl) {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function imagesToPdf(jpegs, imgW, imgH, pageW, pageH) {
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let pos = 0;
  const push = (data) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data;
    chunks.push(bytes);
    pos += bytes.length;
  };
  const objStart = () => { offsets.push(pos); };

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const n = jpegs.length;
  // object numbering: 1 catalog, 2 pages, then per page i: image (3+2i), page (4+2i), then contents streams after
  // simpler sequential build:
  const objs = [];
  const catalogNum = 1, pagesNum = 2;
  let next = 3;
  const pageNums = [], imgNums = [], contentNums = [];
  for (let i = 0; i < n; i++) {
    imgNums.push(next++); contentNums.push(next++); pageNums.push(next++);
  }
  const total = next - 1;

  objStart();
  push(`${catalogNum} 0 obj\n<< /Type /Catalog /Pages ${pagesNum} 0 R >>\nendobj\n`);
  objStart();
  push(`${pagesNum} 0 obj\n<< /Type /Pages /Kids [${pageNums.map(p => p + ' 0 R').join(' ')}] /Count ${n} >>\nendobj\n`);

  for (let i = 0; i < n; i++) {
    const img = dataUrlBytes(jpegs[i]);
    objStart();
    push(`${imgNums[i]} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`);
    push(img);
    push('\nendstream\nendobj\n');

    const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im${i} Do Q`;
    objStart();
    push(`${contentNums[i]} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);

    objStart();
    push(`${pageNums[i]} 0 obj\n<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${i} ${imgNums[i]} 0 R >> >> /Contents ${contentNums[i]} 0 R >>\nendobj\n`);
  }

  const xrefPos = pos;
  let xref = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  push(xref);
  push(`trailer\n<< /Size ${total + 1} /Root ${catalogNum} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

  return new Blob(chunks, { type: 'application/pdf' });
}
