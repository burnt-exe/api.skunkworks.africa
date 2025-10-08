
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, ScanLine, Plus, MoreHorizontal, Boxes, Upload, Download } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from '@/components/ui/label';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';


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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockingItem, setRestockingItem] = useState<StockItem | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { toast } = useToast();


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredStock = useMemo(() => stockItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
      return matchesSearch && matchesFilter;
  }), [stockItems, searchTerm, activeFilter]);

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
          if(field === 'quantity') {
             return { ...updatedItem, status: getStatus(updatedItem.quantity) };
          }
          return updatedItem;
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

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        return newSet;
    });
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedIds(new Set(filteredStock.map(item => item.id)));
    } else {
        setSelectedIds(new Set());
    }
  }
  
  const handleBulkDelete = () => {
    setStockItems(prev => prev.filter(item => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  }
  
  const handleBulkUpdate = (updates: { quantity?: number; price?: number; status?: StockItemStatus }) => {
    setStockItems(prev => prev.map(item => {
        if (selectedIds.has(item.id)) {
            const newQuantity = updates.quantity ?? item.quantity;
            let newStatus = updates.status;
            // if quantity is updated, it takes precedence for status calculation
            if(updates.quantity !== undefined) {
                newStatus = getStatus(newQuantity);
            }

            return {
                ...item,
                quantity: newQuantity,
                price: updates.price ?? item.price,
                status: newStatus ?? item.status,
            };
        }
        return item;
    }));
    setIsBulkEditOpen(false);
    setSelectedIds(new Set());
  };

  const handleMarkOutOfStock = (id: string) => {
      handleItemChange(id, 'quantity', 0);
  }

  const handleOpenRestockDialog = (item: StockItem) => {
    setRestockingItem(item);
    setIsRestockOpen(true);
  }
  
  const handleRestock = (itemId: string, quantityToAdd: number) => {
    setStockItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + quantityToAdd;
          return { ...item, quantity: newQuantity, status: getStatus(newQuantity) };
        }
        return item;
      })
    );
    setIsRestockOpen(false);
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(stockItems.map(({id, status, ...rest}) => rest));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (importedData: Omit<StockItem, 'id' | 'status'>[]) => {
      setStockItems(prev => {
          const updatedStock = [...prev];
          const prevSkuMap = new Map(prev.map(item => [item.sku, item]));

          for (const newItem of importedData) {
              if (prevSkuMap.has(newItem.sku)) {
                  // Update existing item
                  const existingItem = prevSkuMap.get(newItem.sku)!;
                  const itemIndex = updatedStock.findIndex(item => item.id === existingItem.id);
                  updatedStock[itemIndex] = { ...existingItem, ...newItem, status: getStatus(newItem.quantity) };
              } else {
                  // Add new item
                  updatedStock.push({ ...newItem, id: String(Date.now()) + newItem.sku, status: getStatus(newItem.quantity) });
              }
          }
          return updatedStock;
      });
      toast({ title: 'Success', description: 'Inventory has been updated from CSV.' });
      setIsImportOpen(false);
  };


  const filterButtons: { label: string, value: FilterStatus }[] = [
      { label: 'All', value: 'All'},
      { label: 'In Stock', value: 'In Stock'},
      { label: 'Low Stock', value: 'Low Stock'},
      { label: 'Out of Stock', value: 'Out of Stock'},
  ]

  const isAllSelected = filteredStock.length > 0 && selectedIds.size === filteredStock.length;

  return (
    <>
      <div className="space-y-6 pb-20 md:pb-0">
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
                  className="w-full sm:w-auto sm:max-w-xs"
                />
                <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => setIsImportOpen(true)}>
                          <Upload className="mr-2 h-4 w-4" /> Import CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleExportCSV}>
                          <Download className="mr-2 h-4 w-4" /> Export CSV
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleAddNewItem} className="hidden md:inline-flex">
                  <PlusCircle className="mr-2 h-4 w-4" />
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
                        size="sm"
                    >
                        {filter.label}
                    </Button>
                ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] px-4">
                        <Checkbox 
                          checked={isAllSelected}
                          onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                          aria-label="Select all"
                        />
                    </TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="w-[120px] text-right">Quantity</TableHead>
                    <TableHead className="w-[150px] text-right">Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">
                      {selectedIds.size > 0 ? (
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => setIsBulkEditOpen(true)}>
                                      <Edit className="mr-2 h-4 w-4" /> Bulk Edit
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                                          </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                          <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              This will permanently delete {selectedIds.size} selected item(s). This action cannot be undone.
                                          </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                                          </AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>

                              </DropdownMenuContent>
                          </DropdownMenu>
                      ) : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.length > 0 ? (
                    filteredStock.map((item) => (
                      <TableRow key={item.id} onDoubleClick={() => handleEditItem(item)} data-state={selectedIds.has(item.id) && "selected"}>
                        <TableCell className="px-4">
                            <Checkbox
                              checked={selectedIds.has(item.id)}
                              onCheckedChange={(checked) => handleSelect(item.id, Boolean(checked))}
                              aria-label={`Select ${item.name}`}
                            />
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full min-w-[80px] text-right"
                            onBlur={(e) => handleItemChange(item.id, 'quantity', Math.max(0, parseInt(e.target.value, 10) || 0))}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                            className="w-full min-w-[100px] text-right"
                            step="0.01"
                            onBlur={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value).toFixed(2))}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleEditItem(item)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleOpenRestockDialog(item)}>
                                <Boxes className="mr-2 h-4 w-4" /> Restock
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleMarkOutOfStock(item.id)}>
                                <Badge variant="destructive" className="mr-2">0</Badge> Mark as Out of Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the item "{item.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No items match your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
      <BulkEditDialog
        isOpen={isBulkEditOpen}
        onOpenChange={setIsBulkEditOpen}
        onSave={handleBulkUpdate}
        itemCount={selectedIds.size}
      />
       <RestockDialog
        isOpen={isRestockOpen}
        onOpenChange={setIsRestockOpen}
        onRestock={handleRestock}
        item={restockingItem}
      />
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="max-w-md w-full">
            <DialogHeader>
                <DialogTitle>Scan Barcode</DialogTitle>
                <DialogDescription>Point your camera at a barcode to find the item.</DialogDescription>
            </DialogHeader>
            <BarcodeScanner onResult={handleBarcodeScanned} />
        </DialogContent>
      </Dialog>
      <ImportCSVDialog
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={handleImportCSV}
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
        setFormData(prev => ({ ...prev, [name]: isNumeric ? Math.max(0, parseFloat(value) || 0) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
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

interface BulkEditDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updates: { quantity?: number; price?: number; status?: StockItemStatus }) => void;
  itemCount: number;
}

function BulkEditDialog({ isOpen, onOpenChange, onSave, itemCount }: BulkEditDialogProps) {
    const [updates, setUpdates] = useState<{ quantity?: string; price?: string; status?: StockItemStatus }>({});

    useEffect(() => {
        if (isOpen) {
            setUpdates({});
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUpdates: { quantity?: number; price?: number; status?: StockItemStatus } = {};

        if (updates.quantity !== undefined && updates.quantity.trim() !== '') {
            finalUpdates.quantity = parseFloat(updates.quantity);
        }
        if (updates.price !== undefined && updates.price.trim() !== '') {
            finalUpdates.price = parseFloat(updates.price);
        }
        if (updates.status) {
            finalUpdates.status = updates.status;
        }

        onSave(finalUpdates);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Bulk Edit {itemCount} Item(s)</DialogTitle>
                        <DialogDescription>
                            Only fill the fields you want to update. Unchanged fields will be ignored.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="bulk-quantity">Quantity</Label>
                            <Input
                                id="bulk-quantity"
                                type="number"
                                placeholder="Set new quantity"
                                value={updates.quantity ?? ''}
                                onChange={(e) => setUpdates(prev => ({ ...prev, quantity: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bulk-price">Price</Label>
                            <Input
                                id="bulk-price"
                                type="number"
                                placeholder="Set new price"
                                step="0.01"
                                value={updates.price ?? ''}
                                onChange={(e) => setUpdates(prev => ({ ...prev, price: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bulk-status">Status</Label>
                             <Select
                                value={updates.status}
                                onValueChange={(value: StockItemStatus) => setUpdates(prev => ({ ...prev, status: value as StockItemStatus }))}
                            >
                                <SelectTrigger id="bulk-status">
                                    <SelectValue placeholder="Change status (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="In Stock">In Stock</SelectItem>
                                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Note: If quantity is also set, status will be recalculated based on quantity.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Update Items</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface RestockDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onRestock: (itemId: string, quantityToAdd: number) => void;
  item: StockItem | null;
}

function RestockDialog({ isOpen, onOpenChange, onRestock, item }: RestockDialogProps) {
    const [quantityToAdd, setQuantityToAdd] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setQuantityToAdd(0);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (item && quantityToAdd > 0) {
            onRestock(item.id, quantityToAdd);
        }
    };

    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Restock Item</DialogTitle>
                        <DialogDescription>
                           Current quantity for <strong>{item.name}</strong> is <strong>{item.quantity}</strong>. How many items are you adding?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="restock-quantity">Quantity to Add</Label>
                        <Input
                            id="restock-quantity"
                            type="number"
                            min="1"
                            value={quantityToAdd > 0 ? quantityToAdd : ''}
                            onChange={(e) => setQuantityToAdd(parseInt(e.target.value, 10) || 0)}
                            autoFocus
                            required
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={quantityToAdd <= 0}>Add to Stock</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface ImportCSVDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (data: Omit<StockItem, 'id' | 'status'>[]) => void;
}

function ImportCSVDialog({ isOpen, onOpenChange, onImport }: ImportCSVDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setPreviewData([]);
        }
    }, [isOpen]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv') {
                toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a CSV file.' });
                return;
            }
            setFile(selectedFile);
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                preview: 5,
                complete: (results) => {
                    setPreviewData(results.data);
                }
            });
        }
    };

    const handleImport = () => {
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                const requiredFields = ['name', 'sku', 'quantity', 'price'];
                const fileFields = results.meta.fields || [];
                const hasAllFields = requiredFields.every(field => fileFields.includes(field));

                if (!hasAllFields) {
                    toast({ variant: 'destructive', title: 'Invalid CSV Format', description: `CSV must contain headers: ${requiredFields.join(', ')}.` });
                    return;
                }
                
                // Type checking for parsed data could be more robust here
                onImport(results.data as Omit<StockItem, 'id' | 'status'>[]);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                    <DialogTitle>Import from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to add or update inventory items. Ensure your CSV has columns for 'name', 'sku', 'quantity', and 'price'.
                    </DialogDescription>
                </DialogHeader>
                <div 
                    className="mt-4 border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {!file ? (
                        <div>
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Click or drag file to this area to upload</p>
                        </div>
                    ) : (
                         <p className="text-sm font-medium">{file.name}</p>
                    )}
                </div>

                {previewData.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">CSV Preview (first 5 rows)</h4>
                        <div className="max-h-40 overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {Object.keys(previewData[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.map((row, i) => (
                                        <TableRow key={i}>
                                            {Object.values(row).map((val: any, j) => <TableCell key={j}>{String(val)}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleImport} disabled={!file}>Import</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    