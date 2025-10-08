
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, ScanLine, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { cn } from '@/lib/utils';

type StockItemStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type FilterStatus = StockItemStatus | 'All';

type StockItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: StockItemStatus;
};

const getStatus = (quantity: number): StockItemStatus => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
};

const emptyItem: Omit<StockItem, 'id' | 'status'> = { name: '', sku: '', quantity: 0, price: 0 };


export default function EasyStockInventoryPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredStock = stockItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
      return matchesSearch && matchesFilter;
  });

  const getStatusVariant = (status: StockItem['status']) => {
    switch (status) {
      case 'In Stock':
        return 'default';
      case 'Low Stock':
        return 'secondary';
      case 'Out of Stock':
        return 'destructive';
    }
  };

  const handleAddNewItem = () => {
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    setStockItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleSaveItem = (itemData: Omit<StockItem, 'id' | 'status'>) => {
    if (editingItem) {
      setStockItems(prev => prev.map(item =>
        item.id === editingItem.id ? { ...editingItem, ...itemData, status: getStatus(itemData.quantity) } : item
      ));
    } else {
      setStockItems(prev => [
        ...prev,
        { ...itemData, id: String(Date.now()), status: getStatus(itemData.quantity) }
      ]);
    }
    setIsItemDialogOpen(false);
    setEditingItem(null);
  };
  
  const handleItemChange = (id: string, field: keyof StockItem, value: string | number) => {
    setStockItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const parsedValue = typeof value === 'string' && field !== 'name' && field !== 'sku' ? parseFloat(value) || 0 : value;
          const updatedItem = { ...item, [field]: parsedValue };
          return { ...updatedItem, status: getStatus(updatedItem.quantity) };
        }
        return item;
      })
    );
  };
  
  const handleBarcodeScanned = (result: string) => {
    const foundItem = stockItems.find(item => item.sku === result);
    setIsScannerOpen(false);
    if (foundItem) {
        handleEditItem(foundItem);
    } else {
        setEditingItem(null);
        setIsItemDialogOpen(true);
        // Pre-fill SKU from barcode scan
        // This requires a bit of a change in ItemEditDialog to accept initial data differently
    }
  }

  const filterButtons: { label: string, value: FilterStatus }[] = [
      { label: 'All', value: 'All'},
      { label: 'In Stock', value: 'In Stock'},
      { label: 'Low Stock', value: 'Low Stock'},
      { label: 'Out of Stock', value: 'Out of Stock'},
  ]

  return (
    <>
      <div className="space-y-8 pb-20 md:pb-0">
        <div>
          <h1 className="text-2xl font-bold">EasyStock Inventory</h1>
          <p className="text-muted-foreground">
            Manage your stock levels, prices, and item details.
          </p>
        </div>
        <Separator />
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Inventory List</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />
                <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
                    <ScanLine className="mr-2" />
                    Scan
                </Button>
                <Button onClick={handleAddNewItem} className="hidden md:inline-flex">
                  <PlusCircle className="mr-2" />
                  Add New Item
                </Button>
              </div>
            </div>
             <div className="mt-4 flex flex-wrap gap-2">
                {filterButtons.map(filter => (
                    <Button 
                        key={filter.value} 
                        variant={activeFilter === filter.value ? 'default' : 'outline'}
                        onClick={() => setActiveFilter(filter.value)}
                    >
                        {filter.label}
                    </Button>
                ))}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[120px] text-right">Quantity</TableHead>
                  <TableHead className="w-[150px] text-right">Price</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length > 0 ? (
                  filteredStock.map((item) => (
                    <TableRow key={item.id} onDoubleClick={() => handleEditItem(item)}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-full text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                          className="w-full text-right"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No items match your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <Button 
        onClick={handleAddNewItem} 
        className={cn(
            "md:hidden fixed bottom-4 right-4 z-10 rounded-full h-14 w-14 shadow-lg",
            "flex items-center justify-center"
        )}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add New Item</span>
      </Button>

      <ItemEditDialog 
        isOpen={isItemDialogOpen} 
        onOpenChange={setIsItemDialogOpen} 
        onSave={handleSaveItem} 
        item={editingItem}
      />
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Scan Barcode</DialogTitle>
                <DialogDescription>Point your camera at a barcode to find the item.</DialogDescription>
            </DialogHeader>
            <BarcodeScanner onResult={handleBarcodeScanned} />
        </DialogContent>
      </Dialog>
    </>
  );
}


interface ItemEditDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (itemData: Omit<StockItem, 'id'|'status'>) => void;
    item: StockItem | null;
}

function ItemEditDialog({ isOpen, onOpenChange, onSave, item }: ItemEditDialogProps) {
    const [formData, setFormData] = useState(item ? { ...item } : emptyItem);

    useEffect(() => {
        setFormData(item ? { ...item } : emptyItem);
    }, [item, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['quantity', 'price'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Math.max(0, parseFloat(value) || 0) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        <DialogDescription>
                            {item ? "Update the details of your inventory item." : "Fill in the details for the new inventory item."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required autoFocus />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sku" className="text-right">SKU</Label>
                            <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">Quantity</Label>
                            <Input id="quantity" name="quantity" type="number" min="0" value={formData.quantity} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

    
