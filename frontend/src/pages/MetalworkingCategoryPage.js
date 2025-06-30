import React, { useState, useEffect } from 'react';

function MetalworkingCategoryPage() {
  const [allData, setAllData] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Craftman');
  const [selectedCraftsmanType, setSelectedCraftsmanType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Craftman', 'Jobs'];
  const craftsmanTypes = ['Welder', 'Blacksmith', 'Fabricator'];

  useEffect(() => {
    const dummyData = [
      {
        name: 'Alex Mwangi',
        craftsmanType: 'Welder',
        location: 'Nakuru',
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQgPAUbvA7InHTgZ7KE103hhmLLA7Gaq7MVg&s",
        category: 'metalworking',
        type: 'craftman',
      },
      {
        name: 'Beatrice Otieno',
        craftsmanType: 'Fabricator',
        location: 'Eldoret',
        image: 'https://images.unsplash.com/photo-1513350375601-5040cae53a97?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFicmljYXRpb258ZW58MHx8MHx8fDA%3D',
        category: 'metalworking',
        type: 'craftman',
      },
      {
        productName: 'Steel Gate Fabrication',
        description: 'Heavy-duty metal gate with custom design',
        price: 300,
        image: 'https://www.shutterstock.com/image-photo/custom-metal-gate-260nw-2086448415.jpg',
        category: 'metalworking',
        type: 'job',
      },
      {
        productName: 'Window Grills Installation',
        description: 'Security window grills fitted professionally',
        price: 150,
        image: 'https://media.istockphoto.com/id/1317580842/photo/metal-grill-window.jpg?s=612x612&w=0&k=20&c=pHn9HVv7wppqDQRIrSc-hJzYhvQUn1EGtqpBMVZME6I=',
        category: 'metalworking',
        type: 'job',
      }
    ];

    localStorage.setItem('metal_products', JSON.stringify(dummyData));
    setAllData(dummyData);
    filterData('Craftman', '', dummyData);
  }, []);

  const filterData = (category, type, data = allData) => {
    let filtered = data.filter(item => item.category === 'metalworking');

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
      <h2 className="mb-4 text-center">Metalworking {selectedCategory}</h2>

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
                <div className="card-body text-center">
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
                      <p className="card-text fw-bold text-success">${item.price}</p>
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

export default MetalworkingCategoryPage;
