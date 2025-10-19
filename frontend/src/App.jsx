import { createSignal, createEffect } from 'solid-js';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  const [products, setProducts] = createSignal([]);
  const [form, setForm] = createSignal({
    name: '',
    price: ''
  });
  const [editingId, setEditingId] = createSignal(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      console.log('API Response:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/products`, {
        name: form().name,
        price: parseFloat(form().price)
      });
      setForm({ name: '', price: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    const id = editingId();
    if (!id) {
      console.error('Cannot update: editing ID is not set');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/products/${id}`, {
        name: form().name,
        price: parseFloat(form().price)
      });
      setForm({ name: '', price: '' });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleSubmit = (e) => {
    if (editingId()) {
      updateProduct(e);
    } else {
      createProduct(e);
    }
  };

  const deleteProduct = async (id) => {
    if (!id) {
      console.error('Cannot delete: ID is undefined');
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const startEdit = (product) => {
    console.log('Editing product:', product);

    const productId = product.ID || product.id;
    if (!productId) {
      console.warn('Product has no valid ID:', product);
      return;
    }

    setForm({
      name: product.Name || product.name || '',
      price: (product.Price || product.price || 0).toString()
    });
    setEditingId(productId);
  };

  const cancelEdit = () => {
    setForm({ name: '', price: '' });
    setEditingId(null);
  };

  createEffect(() => {
    fetchProducts();
  });

  return (
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Product Management</h1>

      <form
        onSubmit={handleSubmit}
        style="margin-bottom: 20px; display: grid; gap: 10px; max-width: 400px;"
      >
        <input
          type="text"
          placeholder="Product Name"
          value={form().name}
          onInput={(e) => setForm({ ...form(), name: e.target.value })}
          required
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={form().price}
          onInput={(e) => setForm({ ...form(), price: e.target.value })}
          required
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <div style="display: flex; gap: 10px;">
          <button
            type="submit"
            style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; flex: 1;"
          >
            {editingId() ? 'Update Product' : 'Add Product'}
          </button>
          {editingId() && (
            <button
              type="button"
              onClick={cancelEdit}
              style="padding: 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; flex: 1;"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h2>Products</h2>
        <div style="display: grid; gap: 10px;">
          {products().map(product => {
            const productId = product.ID || product.id;
            const productName = product.Name || product.name || 'No Name';
            const productPrice = product.Price || product.price || 0;

            return (
              <div
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8f9fa'
                }}
              >
                <div style="display: flex; gap: 15px; align-items: center;">
                  <span style="font-weight: bold; min-width: 200px;">
                    {productName}
                  </span>
                  <span style="color: #28a745; font-weight: bold;">
                    ${typeof productPrice === 'number' ? productPrice.toFixed(2) : parseFloat(productPrice).toFixed(2)}
                  </span>
                  <span style="color: #6c757d; font-size: 0.9em;">
                    ID: {productId}
                  </span>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button
                    onClick={() => startEdit(product)}
                    style="padding: 5px 10px; background: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer;"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(productId)}
                    style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;