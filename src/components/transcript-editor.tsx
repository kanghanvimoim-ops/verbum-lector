"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Languages, Loader2 } from "lucide-react";

export interface Sentence {
  id: number;
  text: string;
}

interface TranscriptEditorProps {
  sentences: Sentence[];
  onSentencesChange: (sentences: Sentence[]) => void;
  onTranslate: () => void;
  isTranslating: boolean;
}

let nextId = 1000;

export function TranscriptEditor({
  sentences,
  onSentencesChange,
  onTranslate,
  isTranslating,
}: TranscriptEditorProps) {
  
  const handleTextChange = (id: number, newText: string) => {
    const newSentences = sentences.map((s) =>
      s.id === id ? { ...s, text: newText } : s
    );
    onSentencesChange(newSentences);
  };

  const addSentenceAfter = (index: number) => {
    const newSentence: Sentence = { id: nextId++, text: "" };
    const newSentences = [...sentences];
    newSentences.splice(index + 1, 0, newSentence);
    onSentencesChange(newSentences);
  };

  const removeSentence = (id: number) => {
    const newSentences = sentences.filter((s) => s.id !== id);
    onSentencesChange(newSentences);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-4">
        {sentences.map((sentence, index) => (
          <div key={sentence.id} className="group flex items-start gap-2">
            <Textarea
              value={sentence.text}
              onChange={(e) => handleTextChange(sentence.id, e.target.value)}
              className="w-full font-body bg-background"
              rows={1}
            />
            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button
                variant="ghost"
                size="icon"
                onClick={() => addSentenceAfter(index)}
                aria-label="Add paragraph below"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <PlusCircle size={16} />
              </Button>
               <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSentence(sentence.id)}
                aria-label="Remove paragraph"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onTranslate} disabled={isTranslating} size="lg">
          {isTranslating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Languages className="mr-2 h-4 w-4" />
          )}
          Translate to {isTranslating ? '...' : 'Target Language'}
        </Button>
      </div>
    </div>
  );
}
