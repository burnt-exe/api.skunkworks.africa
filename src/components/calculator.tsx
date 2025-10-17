
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from './ui/dialog';
import { useCalculator } from '@/context/CalculatorProvider';

export function Calculator() {
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [overwrite, setOverwrite] = useState(true);

  const calculate = (): string => {
    const prev = parseFloat(previousValue!);
    const current = parseFloat(currentValue);

    if (isNaN(prev) || isNaN(current)) return '0';

    let result: number;
    switch (operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        if (current === 0) return 'Error';
        result = prev / current;
        break;
      default:
        return '0';
    }
    return String(result);
  };
  
  const clear = () => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperator(null);
    setOverwrite(true);
  };

  const clearHistory = () => {
      setHistory([]);
  }

  const inputDigit = (digit: string) => {
    if (currentValue.length > 15) return;
    if (overwrite) {
      setCurrentValue(digit);
      setOverwrite(false);
    } else {
      setCurrentValue(currentValue === '0' ? digit : currentValue + digit);
    }
  };

  const inputDecimal = () => {
    if (overwrite) {
        setCurrentValue('0.');
        setOverwrite(false);
        return;
    }
    if (!currentValue.includes('.')) {
      setCurrentValue(currentValue + '.');
    }
  };
  
  const chooseOperator = (op: string) => {
      if (previousValue && !overwrite) {
          const result = calculate();
          if (result !== 'Error') {
            setHistory(prev => [...prev, `${previousValue} ${operator} ${currentValue} = ${result}`]);
          }
          setCurrentValue(result);
          setPreviousValue(result);
      } else {
          setPreviousValue(currentValue);
      }
      setOperator(op);
      setOverwrite(true);
  }

  const equals = () => {
    if (!operator || !previousValue) return;
    const result = calculate();
    if (result !== 'Error') {
      setHistory(prev => [...prev, `${previousValue} ${operator} ${currentValue} = ${result}`]);
    }
    
    setCurrentValue(result);
    setPreviousValue(null);
    setOperator(null);
    setOverwrite(true);
  };

  const toggleSign = () => {
    setCurrentValue(prev => 
        prev === '0' ? '0' : prev.startsWith('-') ? prev.slice(1) : `-${prev}`
    );
  };

  const percent = () => {
      setCurrentValue(String(parseFloat(currentValue)/100));
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key >= '0' && e.key <= '9') {
          inputDigit(e.key);
      } else if (e.key === '.') {
          inputDecimal();
      } else if (e.key === 'Backspace') {
          setCurrentValue(cv => cv.length > 1 ? cv.slice(0, -1) : '0');
          if (currentValue.length === 1) setOverwrite(true);
      } else if (e.key === 'Enter' || e.key === '=') {
          equals();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
          chooseOperator(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      } else if (e.key.toLowerCase() === 'c' || e.key === 'Escape') {
          clear();
      }
  }, [currentValue, previousValue, operator, overwrite]);

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      };
  }, [handleKeyDown]);


  const renderButton = (
    label: string,
    onClick: () => void,
    className = 'bg-muted hover:bg-muted/80 text-foreground',
    span: 1 | 2 = 1
  ) => (
    <Button
      onClick={onClick}
      className={cn(
          'h-16 text-2xl rounded-lg transition-all duration-150 ease-in-out active:scale-95',
          'focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
          span === 2 ? 'col-span-2' : ''
      )}
      type="button"
      aria-label={label}
    >
      {label}
    </Button>
  );

  return (
    <div className="flex flex-col md:flex-row justify-center items-start gap-8 pt-6">
      <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-headline tracking-tight">Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-background/70 rounded-lg p-4 mb-4 text-right overflow-x-auto">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={previousValue + operator}
                    initial={{ opacity: 0.5, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-8 text-2xl text-muted-foreground font-mono"
                >
                    {previousValue} {operator}
                </motion.div>
            </AnimatePresence>
             <AnimatePresence mode="wait">
                <motion.div 
                    key={currentValue}
                    initial={{ opacity: 0.8, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-mono font-bold"
                    style={{ letterSpacing: '-0.02em'}}
                >
                    {currentValue}
                </motion.div>
             </AnimatePresence>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {renderButton('C', clear, 'bg-destructive/20 hover:bg-destructive/30 text-destructive')}
            {renderButton('±', toggleSign, 'bg-primary/20 hover:bg-primary/30')}
            {renderButton('%', percent, 'bg-primary/20 hover:bg-primary/30')}
            {renderButton('÷', () => chooseOperator('÷'), 'bg-primary/80 hover:bg-primary/90 text-primary-foreground')}
            
            {renderButton('7', () => inputDigit('7'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('8', () => inputDigit('8'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('9', () => inputDigit('9'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('×', () => chooseOperator('×'), 'bg-primary/80 hover:bg-primary/90 text-primary-foreground')}
            
            {renderButton('4', () => inputDigit('4'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('5', () => inputDigit('5'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('6', () => inputDigit('6'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('-', () => chooseOperator('-'), 'bg-primary/80 hover:bg-primary/90 text-primary-foreground')}

            {renderButton('1', () => inputDigit('1'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('2', () => inputDigit('2'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('3', () => inputDigit('3'), 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('+', () => chooseOperator('+'), 'bg-primary/80 hover:bg-primary/90 text-primary-foreground')}
            
            {renderButton('0', () => inputDigit('0'), 'bg-muted/50 hover:bg-muted/70', 2)}
            {renderButton('.', inputDecimal, 'bg-muted/50 hover:bg-muted/70')}
            {renderButton('=', equals, 'bg-primary hover:bg-primary/90 text-primary-foreground')}
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-sm shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-headline tracking-tight">History</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={clearHistory} aria-label="Clear History" disabled={history.length === 0}>
              <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </CardHeader>
        <CardContent>
            {history.length > 0 ? (
                 <ScrollArea className="h-80">
                    <div className="space-y-4 pr-4">
                        {history.slice().reverse().map((calc, index) => (
                            <motion.div 
                                key={history.length - index} 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="text-right border-b border-border/50 pb-2"
                            >
                                <p className="text-muted-foreground text-sm">{calc.split('=')[0]}=</p>
                                <p className="text-lg font-semibold">{calc.split('=')[1]}</p>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="h-80 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <History className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">No history yet</p>
                    <p className="text-sm">Your past calculations will appear here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

export function CalculatorDialog() {
  const { isCalculatorOpen, setCalculatorOpen } = useCalculator();
  return (
    <Dialog open={isCalculatorOpen} onOpenChange={setCalculatorOpen}>
      <DialogContent className="max-w-4xl w-full p-0 border-0 bg-transparent shadow-none">
        <Calculator />
      </DialogContent>
    </Dialog>
  );
}
