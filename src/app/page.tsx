"use client";

import { useState, useMemo, ChangeEvent, useRef } from "react";
import {
  FileUp,
  Languages,
  BookText,
  ClipboardCopy,
  Loader2,
  BookOpen,
  BookCheck,
  Pilcrow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { TranscriptEditor, Sentence, TranscriptEditorHandle } from "@/components/transcript-editor";

import { detectLanguage, DetectLanguageOutput } from "@/ai/flows/detect-language";
import { convertAudioToText } from "@/ai/flows/audio-to-text";
import { translateSentences } from "@/ai/flows/translate-sentences";

const languageMap: Record<string, string> = {
  vi: "Vietnamese",
  ko: "Korean",
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] =
    useState<DetectLanguageOutput | null>(null);
  const [initialSentences, setInitialSentences] = useState<Sentence[]>([]);
  const [editedSentences, setEditedSentences] = useState<Sentence[]>([]);
  const [translatedSentences, setTranslatedSentences] = useState<Sentence[]>(
    []
  );

  const transcriptEditorRef = useRef<TranscriptEditorHandle>(null);

  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        setAudioDataUri(dataUri);
        await processAudio(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAudio = async (dataUri: string) => {
    setIsLoading(true);
    setDetectedLanguage(null);
    setInitialSentences([]);
    setEditedSentences([]);
    setTranslatedSentences([]);

    try {
      setProcessingStep("Detecting language...");
      const langDetectionResult = await detectLanguage({ audioDataUri: dataUri });
      
      const langCode = langDetectionResult.languageCode.split('-')[0];
      if (!['vi', 'ko'].includes(langCode)) {
        toast({
          variant: "destructive",
          title: "Unsupported Language",
          description: `The detected language is not Vietnamese or Korean. Detected: ${langCode}`,
        });
        setIsLoading(false);
        return;
      }
      setDetectedLanguage({...langDetectionResult, languageCode: langCode});
      
      setProcessingStep("Converting audio to text...");
      const textConversionResult = await convertAudioToText({ audioDataUri: dataUri });
      const sentences = textConversionResult.sentences.map(
        (text, index) => ({ id: index, text })
      );
      setInitialSentences(sentences);
      setEditedSentences(sentences);
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "An error occurred while processing the audio file.",
      });
    } finally {
      setIsLoading(false);
      setProcessingStep("");
    }
  };

  const handleTranslate = async () => {
    if (!detectedLanguage || editedSentences.length === 0) return;

    setIsLoading(true);
    setProcessingStep("Translating...");

    try {
      const sourceLanguage = detectedLanguage.languageCode;
      const targetLanguage = sourceLanguage === "vi" ? "ko" : "vi";

      const sentencesToTranslate = editedSentences.map(s => s.text);
      
      const translationResult = await translateSentences({
        sentences: sentencesToTranslate,
        sourceLanguage,
        targetLanguage,
      });

      const newTranslatedSentences = translationResult.translatedSentences.map(
        (text, index) => ({ id: editedSentences[index].id, text })
      );
      
      setTranslatedSentences(newTranslatedSentences);
      toast({
          title: "Translation Complete",
          description: "The text has been successfully translated.",
      });

    } catch (error) {
      console.error("Error translating sentences:", error);
       toast({
        variant: "destructive",
        title: "Translation Error",
        description: "An error occurred during translation.",
      });
    } finally {
      setIsLoading(false);
      setProcessingStep("");
    }
  };
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copied`,
      description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
    });
  };
  
  const handleLineBreak = () => {
    transcriptEditorRef.current?.addSentenceAfterFocused();
  };

  const fullTranscript = useMemo(() => editedSentences.map(s => s.text).join('\n'), [editedSentences]);
  const fullTranslation = useMemo(() => {
    const translationMap = new Map(translatedSentences.map(s => [s.id, s.text]));
    return editedSentences.map(s => translationMap.get(s.id) || '').join('\n');
  }, [editedSentences, translatedSentences]);

  const renderSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
  
  const SectionCard = ({ icon, title, description, children, titleAddon, ...props }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode; titleAddon?: React.ReactNode, [key: string]: any }) => (
    <Card {...props}>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
              <div>
                <CardTitle className="font-headline">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            {titleAddon}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-12">
          <h1 className="font-headline text-5xl font-bold text-primary-dark">
            Verbum Lector
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Upload Your Scripture Audio. Receive the Word, Translated.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <div className="grid md:grid-cols-2 gap-8">
            <SectionCard icon={<FileUp size={24} />} title="1. Upload Audio" description="Start by uploading an audio or video file.">
              <Input id="audio-file" type="file" onChange={handleFileChange} disabled={isLoading} accept="audio/*,video/*" />
            </SectionCard>
            <SectionCard icon={<Languages size={24} />} title="2. Language Detected" description="The language of the scripture will appear here.">
              {isLoading && processingStep.startsWith("Detecting") ? renderSkeleton() : (
                 detectedLanguage ? (
                    <p className="text-lg">
                      Detected Language: <span className="font-bold text-primary">{languageMap[detectedLanguage.languageCode] || 'Unknown'}</span> ({(detectedLanguage.confidence * 100).toFixed(0)}% confidence)
                    </p>
                  ) : <p className="text-muted-foreground">Awaiting file upload...</p>
              )}
            </SectionCard>
          </div>

          <SectionCard 
            icon={<BookText size={24} />} 
            title="3. Transcript" 
            description="Review and edit the generated text."
            titleAddon={
              initialSentences.length > 0 && (
                <Button variant="outline" onClick={handleLineBreak}>
                  <Pilcrow className="mr-2 h-4 w-4" />
                  Line Break
                </Button>
              )
            }
          >
            {isLoading && processingStep.startsWith("Converting") ? renderSkeleton() : (
              initialSentences.length > 0 ? (
                <TranscriptEditor
                  ref={transcriptEditorRef}
                  sentences={editedSentences}
                  onSentencesChange={setEditedSentences}
                  onTranslate={handleTranslate}
                  isTranslating={isLoading && processingStep.startsWith("Translating")}
                />
              ) : <p className="text-muted-foreground">Awaiting language detection...</p>
            )}
          </SectionCard>
          
          <SectionCard icon={<BookOpen size={24} />} title="4. Translation" description="The translated text will be shown side-by-side.">
            {isLoading && processingStep.startsWith("Translating") ? renderSkeleton() : (
              translatedSentences.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2 font-headline">Original ({languageMap[detectedLanguage?.languageCode || '']})</TableHead>
                        <TableHead className="w-1/2 font-headline">Translation ({languageMap[detectedLanguage?.languageCode === 'vi' ? 'ko' : 'vi']})</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedSentences.map((sentence) => (
                        <TableRow key={sentence.id}>
                          <TableCell className="font-body align-top">{sentence.text}</TableCell>
                          <TableCell className="font-body align-top">{translatedSentences.find(t => t.id === sentence.id)?.text || ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : <p className="text-muted-foreground">Awaiting translation...</p>
            )}
          </SectionCard>
          
          <SectionCard icon={<BookCheck size={24} />} title="5. Final Copy" description="Copy the full transcript and translation.">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => copyToClipboard(fullTranscript, "Transcript")} disabled={!fullTranscript} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Full Transcript
              </Button>
              <Button onClick={() => copyToClipboard(fullTranslation, "Translation")} disabled={!fullTranslation} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Full Translation
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
       {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-2xl">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-headline text-muted-foreground">{processingStep}</p>
          </div>
        </div>
      )}
    </main>
  );
}
