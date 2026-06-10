import { useState , useEffect , useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api.jsx';
import AuthContext from '../context/AuthContext.jsx';

export default function ShippingAddressForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
  });
  const [addressId,setAddressId] = useState(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {

  if (!user){
    alert("please login first")
    navigate("/login")
  }
  const fetchAddress = async () => {
    try {
      const res = await api.get("shipping-addresses/");

      if (res.data.length > 0) {
        const address = res.data[0];

        setAddressId(address.id);

        setFormData({
          address: address.address,
          city: address.city,
          state: address.state,
          zipcode: address.zipcode,
          country: address.country,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchAddress();
}, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (addressId) {
        await api.patch(
          `shipping-addresses/${addressId}/`,
          formData
        );
        alert("Address updated!");
      } else {
        await api.post(
          "shipping-addresses/",
          formData
        );
        alert("Address added!");
      }

      navigate("/cart");
    } catch (err) {
      console.error(err);
      alert("Failed to save address");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add Shipping Address</h3>
      <form onSubmit={handleSubmit}>
        {/* <input type="text" name="order" placeholder="Order ID" value={formData.order} onChange={handleChange} required className="form-control mb-2" /> */}
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="form-control mb-2" />
        <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="form-control mb-2" />
        <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required className="form-control mb-2" />
        <input type="text" name="zipcode" placeholder="Zipcode" value={formData.zipcode} onChange={handleChange} required className="form-control mb-2" />
        <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required className="form-control mb-2" />
        <button type="submit" className="btn btn-primary">Save Address</button>
      </form>
    </div>
  );
}
