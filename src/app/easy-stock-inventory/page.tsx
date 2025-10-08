
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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

type StockItemStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

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

const initialStock: StockItem[] = [
  { id: '1', name: 'Laptop Pro', sku: 'LP-001', quantity: 25, price: 1200, status: 'In Stock' },
  { id: '2', name: 'Wireless Mouse', sku: 'WM-002', quantity: 8, price: 25, status: 'Low Stock' },
  { id: '3', name: 'Keyboard', sku: 'KB-003', quantity: 50, price: 75, status: 'In Stock' },
  { id: '4', name: 'Webcam HD', sku: 'WC-004', quantity: 0, price: 80, status: 'Out of Stock' },
  { id: '5', name: 'USB-C Hub', sku: 'HUB-005', quantity: 30, price: 45, status: 'In Stock' },
];

const emptyItem: Omit<StockItem, 'id' | 'status'> = { name: '', sku: '', quantity: 0, price: 0 };


export default function EasyStockInventoryPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStock);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredStock = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    setStockItems(prev => prev.filter(item => item.id !== id));
  };
  
  const handleSaveItem = (itemData: Omit<StockItem, 'id' | 'status'>) => {
    if (editingItem) {
      // Update existing item
      setStockItems(prev => prev.map(item =>
        item.id === editingItem.id ? { ...editingItem, ...itemData, status: getStatus(itemData.quantity) } : item
      ));
    } else {
      // Add new item
      setStockItems(prev => [
        ...prev,
        { ...itemData, id: String(Date.now()), status: getStatus(itemData.quantity) }
      ]);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <>
      <div className="space-y-8">
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
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />
                <Button onClick={handleAddNewItem}>
                  <PlusCircle className="mr-2" />
                  Add New Item
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <ItemEditDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleSaveItem} 
        item={editingItem}
      />
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
        setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
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
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sku" className="text-right">SKU</Label>
                            <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">Quantity</Label>
                            <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" required />
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
