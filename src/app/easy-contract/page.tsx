
'use client';

import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Sparkles, FileText, Download } from 'lucide-react';
import { generateContractAction } from '@/app/actions';
import type { GenerateContractInput } from '@/ai/flows/generate-contract-flow';

type ContractType = 'nda' | 'employment' | 'sales';

const contractTypes: { value: ContractType; label: string; fields: (keyof GenerateContractInput)[] } = {
    nda: {
        value: 'nda',
        label: 'Non-Disclosure Agreement (NDA)',
        fields: ['disclosingParty', 'receivingParty', 'effectiveDate', 'term', 'purpose'],
    },
    // Future contract types can be added here
    // employment: { value: 'employment', label: 'Employment Agreement', fields: [...] },
    // sales: { value: 'sales', label: 'Sales Agreement', fields: [...] },
};


export default function EasyContractPage() {
  const [contractType, setContractType] = useState<ContractType>('nda');
  const [isGenerating, startTransition] = useTransition();
  const [generatedContract, setGeneratedContract] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<GenerateContractInput>>({
      disclosingParty: 'Acme Inc.',
      receivingParty: 'Beta Corp.',
      effectiveDate: new Date().toISOString().split('T')[0],
      term: '2 years',
      purpose: 'To evaluate a potential business relationship.',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    startTransition(async () => {
        setGeneratedContract('');
        const input: GenerateContractInput = {
            contractType: contractType,
            ...formData
        };

        const result = await generateContractAction(input);

        if (result.success && result.data?.contractText) {
            setGeneratedContract(result.data.contractText);
            toast({
                title: 'Contract Generated Successfully',
                description: 'Your document is ready for review below.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: result.error || 'An unknown error occurred.',
            });
        }
    });
  };

  const handleDownload = () => {
      const blob = new Blob([generatedContract], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contractTypes[contractType].label.replace(/\s/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  const renderField = (field: keyof GenerateContractInput) => {
    const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const isTextArea = field === 'purpose';
    const inputType = field.includes('Date') ? 'date' : 'text';

    const commonProps = {
        id: field,
        name: field,
        value: (formData[field] as string) || '',
        onChange: handleInputChange,
        required: true,
    };

    return (
        <div key={field} className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            {isTextArea ? (
                 <Textarea {...commonProps} placeholder={`Enter the ${label.toLowerCase()}`}/>
            ) : (
                <Input {...commonProps} type={inputType} placeholder={`Enter the ${label.toLowerCase()}`} />
            )}
        </div>
    );
  };


  return (
    <div className="grid h-full min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-2 p-4 sm:p-6 md:p-8">
      {/* Left side - Form */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-3">
             <FileText className="h-6 w-6" />
             <CardTitle className="text-2xl">EasyContract Generator</CardTitle>
          </div>
          <CardDescription>
            Select a contract type and fill in the details. The AI will generate a tailored legal document for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-auto">
            <div className="space-y-2">
                <Label htmlFor="contract-type">Contract Type</Label>
                <Select value={contractType} onValueChange={(v) => setContractType(v as ContractType)}>
                    <SelectTrigger id="contract-type">
                        <SelectValue placeholder="Select a document type" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(contractTypes).map(ct => (
                            <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-4">
                {contractTypes[contractType].fields.map(field => renderField(field))}
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Contract
            </Button>
        </CardContent>
      </Card>

      {/* Right side - Preview */}
       <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Document</CardTitle>
                <CardDescription>Review the AI-generated text below. You can copy or download it.</CardDescription>
            </div>
            <Button onClick={handleDownload} disabled={!generatedContract || isGenerating} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
        </CardHeader>
        <CardContent className="flex-1">
            <div className="h-full w-full rounded-md border bg-muted/50 p-4">
                <Textarea
                    readOnly
                    value={generatedContract || 'Your generated contract will appear here...'}
                    className="h-full w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    placeholder="Your generated contract will appear here..."
                />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
