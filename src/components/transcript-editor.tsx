"use client";

import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { flushSync } from 'react-dom';

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

export interface TranscriptEditorHandle {
  splitSentenceAtCursor: () => void;
}

interface EditorFocus {
  index: number;
  cursorPosition: number;
}

let nextId = 1000;

export const TranscriptEditor = forwardRef<TranscriptEditorHandle, TranscriptEditorProps>(({
  sentences,
  onSentencesChange,
  onTranslate,
  isTranslating,
}, ref) => {
  const [focusedInfo, setFocusedInfo] = useState<EditorFocus | null>({ index: 0, cursorPosition: 0 });
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    splitSentenceAtCursor: () => {
      if (focusedInfo === null) return;
      
      const { index: focusedIndex, cursorPosition } = focusedInfo;
      const sentenceToSplit = sentences[focusedIndex];
      
      const textBeforeCursor = sentenceToSplit.text.substring(0, cursorPosition);
      const textAfterCursor = sentenceToSplit.text.substring(cursorPosition);

      const updatedSentence: Sentence = { ...sentenceToSplit, text: textBeforeCursor };
      const newSentence: Sentence = { id: nextId++, text: textAfterCursor };

      const newSentences = [...sentences];
      newSentences.splice(focusedIndex, 1, updatedSentence);
      newSentences.splice(focusedIndex + 1, 0, newSentence);
      
      flushSync(() => {
        onSentencesChange(newSentences);
      });
      
      // 💡 변경 이유: Line Break 후 새로 생긴 입력창에 자동으로 포커스를 이동시키고, 
      // 해당 위치로 스크롤하여 사용자가 보고 있던 위치를 유지합니다.
      setTimeout(() => {
        const nextTextarea = textareaRefs.current[focusedIndex + 1];
        if (nextTextarea) {
          nextTextarea.focus();
          nextTextarea.setSelectionRange(0, 0);
          nextTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);
    },
  }));
  
  const handleTextChange = (id: number, newText: string) => {
    onSentencesChange(
      sentences.map((s) => (s.id === id ? { ...s, text: newText } : s))
    );
  };
  
  const handleFocus = (index: number, e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocusedInfo({ index, cursorPosition: e.target.selectionStart });
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const index = textareaRefs.current.findIndex(ref => ref === textarea);
    if(index !== -1){
        setFocusedInfo({index, cursorPosition: textarea.selectionStart});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setFocusedInfo({ index: focusedInfo?.index || 0, cursorPosition: e.currentTarget.selectionStart });
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-4">
        {sentences.map((sentence, index) => (
          <div key={sentence.id} className="group flex items-start gap-2">
            <Textarea
              ref={el => textareaRefs.current[index] = el}
              value={sentence.text}
              onChange={(e) => handleTextChange(sentence.id, e.target.value)}
              onFocus={(e) => handleFocus(index, e)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => setFocusedInfo({ index, cursorPosition: e.currentTarget.selectionStart })}
              className="w-full font-body bg-background"
              rows={1}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onTranslate} disabled={isTranslating || sentences.length === 0} size="lg">
          {isTranslating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Languages className="mr-2 h-4 w-4" />
          )}
          Translate
        </Button>
      </div>
    </div>
  );
});

TranscriptEditor.displayName = 'TranscriptEditor';
