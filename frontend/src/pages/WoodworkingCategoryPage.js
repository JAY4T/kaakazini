import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function WoodworkingCategoryPage() {
  const [allData, setAllData] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Craftman');
  const [selectedCraftsmanType, setSelectedCraftsmanType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Craftman', 'Jobs'];
  const craftsmanTypes = ['Carpenter', 'Furniture Maker', 'Cabinet Maker'];

  useEffect(() => {
    const dummyData = [
      {
        name: 'John Doe',
        craftsmanType: 'Carpenter',
        location: 'Nairobi',
        image: 'https://www.shutterstock.com/image-photo/african-american-construction-worker-portrait-260nw-2580181895.jpg',
        category: 'woodworking',
        type: 'craftman'
      },
      {
        name: 'Jane Smith',
        craftsmanType: 'Furniture Maker',
        location: 'Mombasa',
        image: 'https://media.istockphoto.com/id/1202486837/photo/photo-of-woman-with-plane.jpg?s=612x612&w=0&k=20&c=5F3HKx8cIaJJ8ZFdt6zOGzrI-Qrg-IPvniD9tHLrMII=',
        category: 'woodworking',
        type: 'craftman'
      },
      {
        serviceName: 'Wooden Table',
        description: 'High-quality mahogany dining table',
        // price: 250,
        image: 'https://thumbs.dreamstime.com/b/distressed-rustic-rectangle-accent-table-handcrafted-modern-farmhouse-furniture-vintage-industrial-flair-stunning-349961861.jpg',
        category: 'woodworking',
        type: 'job'
      },
      {
        serviceName: 'Cabinet Installation',
        description: 'Kitchen cabinet fitting service',
        // price: 120,
        image: 'https://familybusinessplace.com/wp-content/uploads/2024/05/getty-images-BZH640vs3KU-unsplash-1024x683.jpg',
        category: 'woodworking',
        type: 'job'
      }
    ];
    localStorage.setItem('products', JSON.stringify(dummyData));
    setAllData(dummyData);
    filterData('Craftman', '', dummyData);
  }, []);

  const filterData = (category, type, data = allData) => {
    let filtered = data.filter(item => item.category === 'woodworking');

    if (category === 'Craftman') {
      filtered = filtered.filter(item => item.type === 'craftman');
    } else if (category === 'Jobs') {
      filtered = filtered.filter(item => item.type === 'job');
    }

    if (type) {
      filtered = filtered.filter(item => item.craftsmanType === type);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.name || item.productName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setDisplayItems(filtered);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedCraftsmanType('');
    filterData(category, '');
  };

  const handleCraftsmanTypeChange = (e) => {
    const type = e.target.value;
    setSelectedCraftsmanType(type);
    filterData(selectedCategory, type);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterData(selectedCategory, selectedCraftsmanType);
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Woodworking {selectedCategory}</h2>
      
      <div className="row mb-4">
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {selectedCategory === 'Craftman' && (
          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              value={selectedCraftsmanType}
              onChange={handleCraftsmanTypeChange}
            >
              <option value="">All Types</option>
              {craftsmanTypes.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or product..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="row">
        {displayItems.length > 0 ? (
          displayItems.map((item, index) => (
            <div key={index} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={item.image}
                  className="card-img-top"
                  alt={item.name || item.productName}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  {selectedCategory === 'Craftman' ? (
                    <>
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text">{item.craftsmanType}</p>
                      <p className="card-text text-muted">{item.location}</p>
                    </>
                  ) : (
                    <>
                      <h5 className="card-title">{item.productName}</h5>
                      <p className="card-text">{item.description}</p>
                      <p className="card-text fw-bold text-success">{item.price}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WoodworkingCategoryPage;
