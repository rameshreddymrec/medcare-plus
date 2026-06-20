import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCartStore } from '../store/useCartStore';
import type { CartItem } from '../store/useCartStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Search, Pill, ShoppingCart, Plus, Minus, Info, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  prescriptionRequired: boolean;
  ingredients: string;
  sideEffects: string;
  imageUrl?: string;
}

export const Pharmacy: React.FC = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Medicine | null>(null);
  const [viewQty, setViewQty] = useState(1);

  // Cart totals helper
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Categories list
  const categories = ['All', 'Cardiology', 'Pediatrics', 'Antibiotics', 'Pain Relief'];

  const [productList, setProductList] = useState<Medicine[]>([]);

  // Static Products Database
  const defaultMedicines: Medicine[] = [
    {
      id: 'med-1',
      name: 'Atenolol 50mg',
      description: 'Used to treat high blood pressure (hypertension) and reduce cardiovascular strain.',
      price: 180.00,
      category: 'Cardiology',
      stock: 45,
      prescriptionRequired: true,
      ingredients: 'Atenolol (50mg)',
      sideEffects: 'Fatigue, cold extremities, dizziness, low heart rate.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'med-2',
      name: 'Paracetamol 650mg',
      description: 'Analgesic and antipyretic medication used to treat mild to moderate fever and body aches.',
      price: 32.00,
      category: 'Pain Relief',
      stock: 120,
      prescriptionRequired: false,
      ingredients: 'Paracetamol (650mg)',
      sideEffects: 'Rarely triggers skin rashes. Avoid alcohol during dosage.',
      imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'med-3',
      name: 'Amoxicillin 500mg',
      description: 'Penicillin-class antibiotic used to treat diverse bacterial infections (throat, lungs, ears).',
      price: 240.00,
      category: 'Antibiotics',
      stock: 30,
      prescriptionRequired: true,
      ingredients: 'Amoxicillin (500mg)',
      sideEffects: 'Nausea, diarrhea, stomach upset, rash reactions.',
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'med-4',
      name: 'Pediatric Multi-Vitamin Syrup',
      description: 'Essential micronutrients and vitamins complex supporting child growth and immunities.',
      price: 150.00,
      category: 'Pediatrics',
      stock: 15,
      prescriptionRequired: false,
      ingredients: 'Vitamin A, C, D3, B-Complex, Zinc',
      sideEffects: 'None reported if administered in suggested guidelines.',
      imageUrl: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'med-5',
      name: 'Ibuprofen 400mg',
      description: 'Nonsteroidal anti-inflammatory drug (NSAID) reducing joint pain, swelling, and migraines.',
      price: 45.00,
      category: 'Pain Relief',
      stock: 80,
      prescriptionRequired: false,
      ingredients: 'Ibuprofen (400mg)',
      sideEffects: 'Stomach irritation, nausea, dizziness if taken empty stomach.',
      imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'med-6',
      name: 'Lipitor 10mg (Atorvastatin)',
      description: 'Statin medication lowering blood cholesterol levels and preventing cardiovascular disease.',
      price: 420.00,
      category: 'Cardiology',
      stock: 25,
      prescriptionRequired: true,
      ingredients: 'Atorvastatin Calcium (10mg)',
      sideEffects: 'Muscle ache, mild joint stiffness, digestion upset.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
    }
  ];

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/catalog/medicines');
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const mapped: Medicine[] = response.data.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            price: m.price,
            category: m.category?.name || 'General Wellness',
            stock: m.stock,
            prescriptionRequired: m.prescriptionRequired,
            ingredients: m.ingredients || 'Active chemical compound',
            sideEffects: m.sideEffects || 'None reported.',
            imageUrl: m.imageUrl || undefined,
          }));
          setProductList(mapped);
        } else {
          setProductList(defaultMedicines);
        }
      } catch (err) {
        console.warn('[MedCare+ Pharmacy] Catalog API offline, using local fallback.');
        setProductList(defaultMedicines);
      }
    };
    fetchMedicines();
  }, []);

  // Filtering Logic
  const filteredMedicines = useMemo(() => {
    return productList.filter((med) => {
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            med.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productList, searchQuery, selectedCategory]);

  const handleAddToCart = (med: Medicine, qty: number) => {
    const cartItem: CartItem = {
      id: med.id,
      name: med.name,
      price: med.price,
      quantity: qty,
      category: med.category,
    };
    addToCart(cartItem);
    setSelectedProduct(null); // Close modal on add
    setViewQty(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Hero Header */}
      <div style={{
        background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem',
        padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Pill style={{ height: '0.875rem', width: '0.875rem', color: '#2563EB' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em' }}>MedCare+ Pharmacy</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 0.35rem' }}>Online E-Pharmacy</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Order medicines directly to your door with prescription validation.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '18rem' }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', height: '0.875rem', width: '0.875rem', color: '#94a3b8' }} />
            <input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem',
                border: '1px solid #E2E8F0', borderRadius: '0.625rem', fontSize: '0.875rem',
                color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box',
              }}
            />
          </div>
          <Link to="/pharmacy/cart">
            <button style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem', background: '#2563EB', color: '#fff',
              border: 'none', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            }}>
              <ShoppingCart style={{ height: '1rem', width: '1rem' }} />
              Cart ({cartCount})
            </button>
          </Link>
        </div>
      </div>

      {/* Main Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Categories list */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Medicine Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-md shadow-primary/10'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'All' ? 'All Products' : cat}
                </button>
              ))}
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-5 text-xs text-slate-500 leading-relaxed space-y-2">
              <div className="flex items-center space-x-1.5 text-accent font-bold mb-1">
                <Info className="h-4 w-4 shrink-0" />
                <span>Prescription Checking</span>
              </div>
              Medicines marked with <Badge variant="danger" className="text-[8px] px-1 py-0 inline-block font-black">Rx REQUIRED</Badge> require an uploaded PDF or image file from your doctor to complete checkout.
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Products Catalog Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((med) => (
              <Card key={med.id} hoverEffect className="flex flex-col h-full justify-between overflow-hidden">
                <div style={{
                  height: '8.5rem', width: '100%', overflow: 'hidden',
                  background: '#F8FAFC', borderBottom: '1px solid #F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  {med.imageUrl ? (
                    <img 
                      src={med.imageUrl} 
                      alt={med.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <Pill style={{ height: '2rem', width: '2rem', color: '#cbd5e1' }} />
                  )}
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                    <Badge variant="neutral" className="text-[9px] font-semibold bg-white/95 text-slate-800 border-none shadow-sm">{med.category}</Badge>
                  </div>
                  {med.prescriptionRequired && (
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                      <Badge variant="danger" className="text-[8px] font-black shadow-sm">Rx REQUIRED</Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm font-bold text-slate-800 truncate">{med.name}</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 flex-grow flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-450 leading-relaxed line-clamp-3">{med.description}</p>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-extrabold text-slate-900">₹{med.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Stock: {med.stock} units</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleAddToCart(med, 1)}
                      className="w-full"
                    >
                      Add To Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedProduct(med);
                        setViewQty(1);
                      }}
                      className="w-full flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredMedicines.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white border border-light-border rounded-xl">
                <Pill className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-500">No medicines found matching details</h4>
                <p className="text-xs text-slate-400 mt-1">Try resetting category filters or searching general items.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Product Details Modal Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 z-55 border border-light-border"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <Badge variant="neutral" className="text-[9px]">{selectedProduct.category}</Badge>
                    {selectedProduct.prescriptionRequired && (
                      <Badge variant="danger" className="text-[8px] font-black">Rx REQUIRED</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedProduct.name}</h3>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-1 rounded-lg text-slate-450 hover:bg-slate-100 cursor-pointer">
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              {selectedProduct.imageUrl && (
                <div style={{
                  height: '12rem', width: '100%', borderRadius: '0.75rem',
                  overflow: 'hidden', margin: '1rem 0 0.5rem', border: '1px solid #F1F5F9'
                }}>
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              )}

              <div className="space-y-4 py-4 text-xs sm:text-sm leading-relaxed max-h-[45vh] overflow-y-auto pr-1">
                <div>
                  <span className="font-bold text-slate-400 block mb-1">Description</span>
                  <p className="text-slate-600">{selectedProduct.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-400 block mb-1">Active Ingredients</span>
                    <p className="text-slate-650">{selectedProduct.ingredients}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block mb-1">Common Side Effects</span>
                    <p className="text-slate-650">{selectedProduct.sideEffects}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
                <span className="text-xl font-extrabold text-slate-800">
                  ₹{(selectedProduct.price * viewQty).toFixed(2)}
                </span>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-lg p-1">
                    <button 
                      onClick={() => setViewQty(Math.max(1, viewQty - 1))}
                      className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-bold">{viewQty}</span>
                    <button 
                      onClick={() => setViewQty(viewQty + 1)}
                      className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Button onClick={() => handleAddToCart(selectedProduct, viewQty)}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};
