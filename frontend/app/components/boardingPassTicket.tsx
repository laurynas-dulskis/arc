import React from "react";
import type { BoardingPass } from "~/model/boardingPass";

type PrintOptions = {
  pageWidthMm?: number;
  pageHeightMm?: number;
  marginMm?: number;
  contentWidthMm?: number;
  orientation?: "portrait" | "landscape";
};

type Props = {
  pass: BoardingPass;
  printOptions?: PrintOptions;
};

export default function BoardingPassTicket({ pass, printOptions }: Props) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const barcodeValue = `${pass.flightNumber} ${pass.pnr}`;

  React.useEffect(() => {
    if (!svgRef.current) return;
    try {
      import("jsbarcode").then((mod: any) => {
        const JB = mod?.default ?? mod;
        if (!svgRef.current) return;
        JB(svgRef.current, barcodeValue, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 60,
          displayValue: false,
          margin: 0,
        });
      });
    } catch (e) {
      console.warn("Barcode generation failed", e);
    }
  }, [barcodeValue]);

  const handlePrint = React.useCallback(() => {
    const node = rootRef.current;
    if (!node) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const headLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join("\n");

    const marginMm = printOptions?.marginMm ?? 10;
    let pageW = printOptions?.pageWidthMm;
    let pageH = printOptions?.pageHeightMm;
    if (printOptions?.orientation === "landscape" && pageW && pageH) {
      [pageW, pageH] = [pageH, pageW];
    }
    const pageRule = pageW && pageH
      ? `@page { size: ${pageW}mm ${pageH}mm; margin: ${marginMm}mm; }`
      : `@page { margin: ${marginMm}mm; }`;
    const contentWidth = ((): string => {
      if (typeof printOptions?.contentWidthMm === "number") {
        return `${printOptions.contentWidthMm}mm`;
      }
      if (pageW) {
        const inner = Math.max(pageW - marginMm * 2, 0);
        return `${inner}mm`;
      }
      return "100%";
    })();

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <base href="${document.baseURI}">
          ${headLinks}
          <style>
            ${pageRule}
            html, body { background: white; color: black; }
            /* Ensure ticket uses full width on paper */
            body { display: flex; justify-content: center; }
            .print-container { width: ${contentWidth}; max-width: none; }
          </style>
        </head>
        <body>
          <div class="print-container">${node.outerHTML}</div>
        </body>
      </html>`;

    doc.open();
    doc.write(html);
    doc.close();

    const printAndCleanup = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn("Print failed, using fallback", e);
        window.print();
      } finally {
        setTimeout(() => {
          iframe.parentNode && iframe.parentNode.removeChild(iframe);
        }, 1000);
      }
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => setTimeout(printAndCleanup, 50));
    } else {
      setTimeout(printAndCleanup, 150);
    }
  }, []);

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label={`Print boarding pass for flight ${pass.flightNumber}`}
      onClick={handlePrint}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePrint();
        }
      }}
      className="cursor-pointer select-none w-full bg-white text-black rounded-xl shadow-md border border-gray-200 overflow-hidden flex max-w-[900px] min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 print:shadow-none print:border-0 print:max-w-full print:rounded-none"
    >
      {/* Left section */}
      <div className="flex-[2.5] p-6 flex flex-col justify-between">
        <div>
          <div className="font-bold text-base tracking-wider">JETGET AIRLINE</div>
          <div className="flex items-baseline gap-4 mt-2">
            <div className="text-4xl font-extrabold uppercase">{pass.departureAirport}</div>
            <div className="text-4xl font-bold">→</div>
            <div className="text-4xl font-extrabold uppercase">{pass.arrivalAirport}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 mt-5">
          <Field label="FLIGHT" value={pass.flightNumber} />
          <Field label="DATE" value={pass.date} />
          <Field label="BOARD" value={pass.boardingTime} />
          <Field label="GATE" value={pass.gate} />
          <Field label="SEAT" value={pass.seat} />
          <Field label="PNR" value={pass.pnr} />
        </div>

        <div className="mt-3">
          <div className="text-xs tracking-wide text-gray-500">PASSENGER</div>
          <div className="font-extrabold text-sm uppercase">{pass.passengerName}</div>
        </div>
      </div>

      {/* Middle perforation */}
      <div className="w-[2px] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_8px,#ccc_8px,#ccc_12px)]" />

      {/* Right stub */}
      <div className="flex-[1.2] p-6 flex flex-col justify-between bg-gray-50 print:bg-white">
        <div className="flex flex-col gap-3">
          <div className="font-bold text-base">{pass.flightNumber} / {pass.date}</div>
          <div className="flex items-center justify-between text-sm">
            <span className="uppercase">{pass.departureAirport} → {pass.arrivalAirport}</span>
            <span>{pass.gate}</span>
          </div>
          <svg ref={svgRef} className="mt-20 w-full h-[60px]" />
        </div>
        <div className="text-[11px] text-gray-600 text-center">
          Boarding at {pass.boardingTime} — Gate closes 10 min before departure
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="w-[120px]">
      <div className="text-[11px] text-gray-500 tracking-wide">{label}</div>
      <div className="font-bold text-base mt-0.5 uppercase">{value}</div>
    </div>
  );
}
