'use client';

import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

// ---------------------------------------------------------------------------
// Material catalogue data (static for now, will eventually be API-driven)
// ---------------------------------------------------------------------------

interface CatalogueItem {
  id: string;
  name: string;
  manufacturer: string;
  sku: string;
  category: string;
  unit: string;
  defaultPrice: number;
  suppliers: string[];
  inStock: boolean;
}

const CATEGORIES = [
  'all',
  'Shingles',
  'Underlayment',
  'Flashing',
  'Ridge & Hip',
  'Ventilation',
  'Nails & Fasteners',
  'Ice & Water Shield',
  'Drip Edge',
] as const;

const CATALOGUE: CatalogueItem[] = [
  // Shingles
  { id: 'sh-01', name: 'Timberline HDZ', manufacturer: 'GAF', sku: 'GAF-THDZ-CW', category: 'Shingles', unit: 'bundle', defaultPrice: 42, suppliers: ['ABC Supply Co.', 'SRS Distribution', 'Beacon Roofing'], inStock: true },
  { id: 'sh-02', name: 'Duration STORM', manufacturer: 'Owens Corning', sku: 'OC-DSTM-OX', category: 'Shingles', unit: 'bundle', defaultPrice: 48, suppliers: ['ABC Supply Co.', 'Beacon Roofing'], inStock: true },
  { id: 'sh-03', name: 'Landmark PRO', manufacturer: 'CertainTeed', sku: 'CT-LMPRO-WX', category: 'Shingles', unit: 'bundle', defaultPrice: 44, suppliers: ['SRS Distribution', 'Beacon Roofing'], inStock: true },
  { id: 'sh-04', name: 'Timberline UHDZ', manufacturer: 'GAF', sku: 'GAF-UHDZ-BK', category: 'Shingles', unit: 'bundle', defaultPrice: 58, suppliers: ['ABC Supply Co.', 'SRS Distribution'], inStock: true },
  { id: 'sh-05', name: 'Duration FLEX', manufacturer: 'Owens Corning', sku: 'OC-DFLX-DW', category: 'Shingles', unit: 'bundle', defaultPrice: 52, suppliers: ['ABC Supply Co.'], inStock: false },

  // Underlayment
  { id: 'ul-01', name: 'FeltBuster Synthetic', manufacturer: 'GAF', sku: 'GAF-FBS-10', category: 'Underlayment', unit: 'roll', defaultPrice: 85, suppliers: ['ABC Supply Co.', 'SRS Distribution'], inStock: true },
  { id: 'ul-02', name: 'Deck Defense', manufacturer: 'GAF', sku: 'GAF-DD-HT', category: 'Underlayment', unit: 'roll', defaultPrice: 92, suppliers: ['ABC Supply Co.', 'Beacon Roofing'], inStock: true },
  { id: 'ul-03', name: 'ProArmor Synthetic', manufacturer: 'Owens Corning', sku: 'OC-PAS-SU', category: 'Underlayment', unit: 'roll', defaultPrice: 88, suppliers: ['SRS Distribution'], inStock: true },
  { id: 'ul-04', name: '#30 Felt', manufacturer: 'Generic', sku: 'GEN-F30', category: 'Underlayment', unit: 'roll', defaultPrice: 28, suppliers: ['ABC Supply Co.', 'SRS Distribution', 'Beacon Roofing'], inStock: true },

  // Flashing
  { id: 'fl-01', name: 'Step Flashing 4x4', manufacturer: 'Generic', sku: 'GEN-SF44-AL', category: 'Flashing', unit: 'each', defaultPrice: 0.85, suppliers: ['ABC Supply Co.', 'SRS Distribution'], inStock: true },
  { id: 'fl-02', name: 'Pipe Boot 1.5-3"', manufacturer: 'Oatey', sku: 'OAT-PB-3', category: 'Flashing', unit: 'each', defaultPrice: 14, suppliers: ['ABC Supply Co.', 'SRS Distribution', 'Beacon Roofing'], inStock: true },
  { id: 'fl-03', name: 'Galvanized Valley Metal 20"', manufacturer: 'Generic', sku: 'GEN-GVM-20', category: 'Flashing', unit: 'linear ft', defaultPrice: 2.50, suppliers: ['ABC Supply Co.'], inStock: true },

  // Ridge & Hip
  { id: 'rh-01', name: 'TimberTex Ridge Caps', manufacturer: 'GAF', sku: 'GAF-TTX-CW', category: 'Ridge & Hip', unit: 'bundle', defaultPrice: 65, suppliers: ['ABC Supply Co.', 'SRS Distribution'], inStock: true },
  { id: 'rh-02', name: 'DecoRidge Ridge Caps', manufacturer: 'Owens Corning', sku: 'OC-DR-OX', category: 'Ridge & Hip', unit: 'bundle', defaultPrice: 72, suppliers: ['ABC Supply Co.', 'Beacon Roofing'], inStock: true },
  { id: 'rh-03', name: 'Shadow Ridge', manufacturer: 'CertainTeed', sku: 'CT-SR-WX', category: 'Ridge & Hip', unit: 'bundle', defaultPrice: 68, suppliers: ['SRS Distribution'], inStock: true },

  // Ventilation
  { id: 'vn-01', name: 'Cobra Snow Country Exhaust', manufacturer: 'GAF', sku: 'GAF-CSC-EX', category: 'Ventilation', unit: 'linear ft', defaultPrice: 4.20, suppliers: ['ABC Supply Co.', 'SRS Distribution'], inStock: true },
  { id: 'vn-02', name: 'VentSure 4-Foot Strip', manufacturer: 'Owens Corning', sku: 'OC-VS4-BK', category: 'Ventilation', unit: 'each', defaultPrice: 18, suppliers: ['ABC Supply Co.'], inStock: true },
  { id: 'vn-03', name: 'Roof Louver 750', manufacturer: 'Air Vent', sku: 'AV-RL750', category: 'Ventilation', unit: 'each', defaultPrice: 32, suppliers: ['SRS Distribution', 'Beacon Roofing'], inStock: false },

  // Nails & Fasteners
  { id: 'nf-01', name: '1.25" Coil Roofing Nails', manufacturer: 'Grip-Rite', sku: 'GR-CRN-125', category: 'Nails & Fasteners', unit: 'box (7200ct)', defaultPrice: 65, suppliers: ['ABC Supply Co.', 'SRS Distribution', 'Beacon Roofing'], inStock: true },
  { id: 'nf-02', name: '1.75" Cap Nails', manufacturer: 'Grip-Rite', sku: 'GR-CN-175', category: 'Nails & Fasteners', unit: 'box (3000ct)', defaultPrice: 42, suppliers: ['ABC Supply Co.', 'SRS Distribution'], inStock: true },

  // Ice & Water Shield
  { id: 'iw-01', name: 'StormGuard', manufacturer: 'GAF', sku: 'GAF-SG-2SQ', category: 'Ice & Water Shield', unit: 'roll', defaultPrice: 115, suppliers: ['ABC Supply Co.', 'SRS Distribution'], inStock: true },
  { id: 'iw-02', name: 'WeatherLock G', manufacturer: 'Owens Corning', sku: 'OC-WLG-2SQ', category: 'Ice & Water Shield', unit: 'roll', defaultPrice: 108, suppliers: ['ABC Supply Co.', 'Beacon Roofing'], inStock: true },
  { id: 'iw-03', name: 'WinterGuard', manufacturer: 'CertainTeed', sku: 'CT-WG-HT', category: 'Ice & Water Shield', unit: 'roll', defaultPrice: 112, suppliers: ['SRS Distribution'], inStock: true },

  // Drip Edge
  { id: 'de-01', name: 'Type D Drip Edge 10\'', manufacturer: 'Generic', sku: 'GEN-DE-D10', category: 'Drip Edge', unit: 'each', defaultPrice: 6.50, suppliers: ['ABC Supply Co.', 'SRS Distribution', 'Beacon Roofing'], inStock: true },
  { id: 'de-02', name: 'Type F Drip Edge 10\'', manufacturer: 'Generic', sku: 'GEN-DE-F10', category: 'Drip Edge', unit: 'each', defaultPrice: 8.25, suppliers: ['ABC Supply Co.', 'SRS Distribution'], inStock: true },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MaterialCataloguePage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = CATALOGUE;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    if (supplierFilter !== 'all') {
      result = result.filter(item => item.suppliers.includes(supplierFilter));
    }
    return result;
  }, [search, categoryFilter, supplierFilter]);

  const uniqueSuppliers = Array.from(new Set(CATALOGUE.flatMap(i => i.suppliers)));
  const inStockCount = CATALOGUE.filter(i => i.inStock).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--ops-font-display)' }}>
            Material Catalogue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {CATALOGUE.length} products · {inStockCount} in stock · {CATEGORIES.length - 1} categories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Products</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{CATALOGUE.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suppliers</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{uniqueSuppliers.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Stock</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-green-600">{inStockCount}</p>
          {CATALOGUE.length - inStockCount > 0 && (
            <p className="text-xs text-red-500 mt-0.5">{CATALOGUE.length - inStockCount} out of stock</p>
          )}
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products, SKUs, manufacturers..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {categoryFilter === 'all' ? 'Category' : categoryFilter}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {CATEGORIES.map(c => (
              <DropdownMenuItem key={c} onClick={() => setCategoryFilter(c)}>
                {c === 'all' ? 'All Categories' : c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {supplierFilter === 'all' ? 'Supplier' : supplierFilter}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSupplierFilter('all')}>All Suppliers</DropdownMenuItem>
            {uniqueSuppliers.map(s => (
              <DropdownMenuItem key={s} onClick={() => setSupplierFilter(s)}>{s}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm">No products found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Suppliers</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.manufacturer}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{item.sku}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border bg-muted text-muted-foreground">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      ${item.defaultPrice < 1 ? item.defaultPrice.toFixed(2) : item.defaultPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{item.suppliers.length} supplier{item.suppliers.length > 1 ? 's' : ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.inStock ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-600 border border-red-200">
                          Out of Stock
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
              <span>Showing {filtered.length} of {CATALOGUE.length} products</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
