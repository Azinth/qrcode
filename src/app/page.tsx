"use client";

import { useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, QrCode, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [text, setText] = useState("dDhkZmRfMTE0Mzg2OzYwMjQz");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [color, setColor] = useState("#000000");
  const { toast } = useToast();

  const generateQrCode = async () => {
    if (!text) {
      toast({
        title: "Erro",
        description: "Por favor, insira um texto para gerar o QR Code.",
        variant: "destructive",
      })
      return;
    };
    setIsLoading(true);
    setQrCodeUrl(""); // Clear previous QR code
    try {
      const url = await QRCode.toDataURL(text, {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: color,
          light: "#00000000", // Transparent background
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro na Geração",
        description: "Não foi possível gerar o QR Code. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQrCode = async (format: "png" | "jpeg" | "svg") => {
    try {
      let dataUrl;
      let fileExtension;

      if (format === "svg") {
        const svgString = await QRCode.toString(text, {
          type: "svg",
          errorCorrectionLevel: "H",
          margin: 1,
          color: {
            dark: color,
            light: "#FFFFFF", // SVG does not support transparent background easily
          },
        });
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        dataUrl = URL.createObjectURL(blob);
        fileExtension = "svg";
      } else {
        dataUrl = await QRCode.toDataURL(text, {
          errorCorrectionLevel: "H",
          type: `image/${format}`,
          quality: 0.92,
          margin: 1,
          color: {
            dark: color,
            light: "#FFFFFF",
          },
        });
        fileExtension = format;
      }
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qrcode.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if(format === 'svg') {
        URL.revokeObjectURL(dataUrl);
      }

    } catch (err) {
      console.error(err);
      toast({
        title: "Erro no Download",
        description: "Não foi possível fazer o download do QR Code.",
        variant: "destructive",
      });
    }
  };


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <QrCode className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline">QRCode Swift</CardTitle>
          <CardDescription>
            Digite um texto abaixo para gerar seu QR Code instantaneamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Input
                id="text"
                placeholder="Ex: dDhkZmRfMTE0Mzg2OzYwMjQz"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && generateQrCode()}
                aria-label="Texto para gerar QR Code"
              />
            </div>
             <div className="space-y-3">
              <Label>Cor do QR Code</Label>
              <RadioGroup
                defaultValue="#000000"
                onValueChange={setColor}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="#000000" id="c-black" />
                  <Label htmlFor="c-black">Preto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="#3F51B5" id="c-blue" />
                  <Label htmlFor="c-blue">Azul</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="#FF0000" id="c-red" />
                  <Label htmlFor="c-red">Vermelho</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="#008000" id="c-green" />
                  <Label htmlFor="c-green">Verde</Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              onClick={generateQrCode}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Gerando..." : "Gerar QR Code"}
            </Button>
          </div>

          {qrCodeUrl && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 animate-in fade-in-50 zoom-in-95 duration-500">
              <p className="text-sm text-muted-foreground">Seu QR Code está pronto!</p>
              <div className="rounded-lg border bg-card p-4 shadow-inner">
                <Image
                  src={qrCodeUrl}
                  alt="Generated QR Code"
                  width={256}
                  height={256}
                  className="rounded-md"
                  priority
                />
              </div>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => downloadQrCode("png")}>PNG</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadQrCode("jpeg")}>JPG</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadQrCode("svg")}>SVG</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
