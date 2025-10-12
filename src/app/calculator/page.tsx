'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const clearDisplay = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };
  
  const toggleSign = () => {
      setDisplayValue(
        displayValue.charAt(0) === '-' ? displayValue.slice(1) : '-' + displayValue
      );
  }

  const inputPercent = () => {
      const currentValue = parseFloat(displayValue);
      if (currentValue === 0) return;
      setDisplayValue(String(currentValue / 100));
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator);
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplayValue(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '*':
        return first * second;
      case '/':
        return first / second;
      default:
        return second;
    }
  };

  const renderButton = (
    label: string,
    onClick: () => void,
    className = 'bg-muted hover:bg-muted/80 text-foreground',
    span: 1 | 2 = 1
  ) => (
    <Button
      onClick={onClick}
      className={`h-16 text-2xl rounded-lg ${className} ${span === 2 ? 'col-span-2' : ''}`}
      type="button"
    >
      {label}
    </Button>
  );

  return (
    <div className="flex justify-center items-start pt-10">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            readOnly
            value={displayValue}
            className="h-20 text-5xl text-right font-mono bg-background mb-4 pr-4"
          />
          <div className="grid grid-cols-4 gap-2">
            {renderButton(displayValue !== '0' ? 'C' : 'AC', clearDisplay, 'bg-destructive/80 hover:bg-destructive/70 text-white')}
            {renderButton('+/-', toggleSign, 'bg-muted hover:bg-muted/80')}
            {renderButton('%', inputPercent, 'bg-muted hover:bg-muted/80')}
            {renderButton('÷', () => performOperation('/'), 'bg-primary hover:bg-primary/90 text-primary-foreground')}
            
            {renderButton('7', () => inputDigit('7'))}
            {renderButton('8', () => inputDigit('8'))}
            {renderButton('9', () => inputDigit('9'))}
            {renderButton('×', () => performOperation('*'), 'bg-primary hover:bg-primary/90 text-primary-foreground')}
            
            {renderButton('4', () => inputDigit('4'))}
            {renderButton('5', () => inputDigit('5'))}
            {renderButton('6', () => inputDigit('6'))}
            {renderButton('-', () => performOperation('-'), 'bg-primary hover:bg-primary/90 text-primary-foreground')}

            {renderButton('1', () => inputDigit('1'))}
            {renderButton('2', () => inputDigit('2'))}
            {renderButton('3', () => inputDigit('3'))}
            {renderButton('+', () => performOperation('+'), 'bg-primary hover:bg-primary/90 text-primary-foreground')}
            
            {renderButton('0', () => inputDigit('0'), 'bg-muted hover:bg-muted/80', 2)}
            {renderButton('.', inputDecimal)}
            {renderButton('=', () => performOperation('='), 'bg-primary hover:bg-primary/90 text-primary-foreground')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
