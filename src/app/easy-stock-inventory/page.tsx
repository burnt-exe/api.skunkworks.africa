
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type StockItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

const initialStock: StockItem[] = [
  { id: '1', name: 'Laptop Pro', sku: 'LP-001', quantity: 25, price: 1200, status: 'In Stock' },
  { id: '2', name: 'Wireless Mouse', sku: 'WM-002', quantity: 8, price: 25, status: 'Low Stock' },
  { id: '3', name: 'Keyboard', sku: 'KB-003', quantity: 50, price: 75, status: 'In Stock' },
  { id: '4', name: 'Webcam HD', sku: 'WC-004', quantity: 0, price: 80, status: 'Out of Stock' },
  { id: '5', name: 'USB-C Hub', sku: 'HUB-005', quantity: 30, price: 45, status: 'In Stock' },
];

export default function EasyStockInventoryPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStock);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
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
                <Button>
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
                    <Button variant="ghost" size="icon" className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
  );
}
