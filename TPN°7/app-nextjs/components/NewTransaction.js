import { useState } from 'react';

export default function NewTransaction({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    userId: 'user-123', // [cite: 84]
    fromAccount: 'ACC-001', // [cite: 91]
    toAccount: 'ACC-002', // [cite: 87]
    amount: 100.00,
    currency: 'USD', // [cite: 85]
    description: 'pago de servicios', // [cite: 94]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataWithAmountAsNumber = {
      ...formData,
      amount: parseFloat(formData.amount)
    }
    onSubmit(dataWithAmountAsNumber);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        Nueva Transaccion bancaria
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Columna 1 */}
        <div>
          <label style={labelStyle}>Usuario ID</label>
          <input style={inputStyle} type="text" name="userId" value={formData.userId} onChange={handleChange} />
          
          <label style={labelStyle}>Desde la cuenta</label>
          <input style={inputStyle} type="text" name="fromAccount" value={formData.fromAccount} onChange={handleChange} />
          
          <label style={labelStyle}>Monto</label>
          <input style={inputStyle} type="number" name="amount" value={formData.amount} onChange={handleChange} />
        </div>
        
        {/* Columna 2 */}
        <div>
          <label style={labelStyle}>Tipo de moneda</label>
          <input style={inputStyle} type="text" name="currency" value={formData.currency} onChange={handleChange} />
          
          <label style={labelStyle}>A la Cuenta</label>
          <input style={inputStyle} type="text" name="toAccount" value={formData.toAccount} onChange={handleChange} />

          <label style={labelStyle}>Descripcion (Opcional)</label>
          <input style={inputStyle} type="text" name="description" value={formData.description} onChange={handleChange} />
        </div>
      </div>
      <button type="submit" style={{ width: '100%', marginTop: '20px', padding: '12px' }} disabled={isSubmitting}>
        {isSubmitting ? 'Cargando...' : 'Iniciar transacción'}
      </button>
    </form>
  );
}

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#aaa' };
const inputStyle = { width: '100%', marginBottom: '15px' };