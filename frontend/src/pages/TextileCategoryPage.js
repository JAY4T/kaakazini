import React, { useState, useEffect } from 'react';

function TextileCategoryPage() {
  const [allTextileData, setAllTextileData] = useState([]);
  const [filteredTextileItems, setFilteredTextileItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Products');
  const [selectedTextileType, setSelectedTextileType] = useState('');
  
  // You can customize these as per your textile data types
  const categories = ['Products', 'Services'];
  const textileTypes = ['Clothing', 'Upholstery', 'Home Decor'];

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('products')) || [];
    const textileItems = storedData.filter(item => item.category === 'textile');
    setAllTextileData(textileItems);
    filterData('Products', '', textileItems);
  }, []);

  const filterData = (category, type, sourceData = allTextileData) => {
    let filtered = sourceData;

    if (category === 'Products') {
      filtered = filtered.filter(item => item.type === 'product');
    } else if (category === 'Services') {
      filtered = filtered.filter(item => item.type === 'service');
    }

    if (type) {
      filtered = filtered.filter(item => item.textileType === type);
    }

    setFilteredTextileItems(filtered);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedTextileType('');
    filterData(newCategory, '');
  };

  const handleTextileTypeChange = (e) => {
    const type = e.target.value;
    setSelectedTextileType(type);
    filterData(selectedCategory, type);
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Filter Panel */}
        <div className="col-md-4">
          <div className="card shadow-lg p-4">
            <div className="mb-3">
              <label htmlFor="textileCategorySelect" className="form-label">Browse Categories</label>
              <select
                id="textileCategorySelect"
                className="form-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="textileTypeSelect"
                className="form-select"
                value={selectedTextileType}
                onChange={handleTextileTypeChange}
              >
                <option value="">All Types</option>
                {textileTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Display Panel */}
        <div className="col-md-8">
          <div className="row">
            {filteredTextileItems.length > 0 ? (
              filteredTextileItems.map((item, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.productName || item.name}
                      className="card-img-top"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="card-body text-center">
                      <h5 className="card-title">{item.productName || item.name}</h5>
                      {selectedCategory === 'Products' ? (
                        <>
                          <p className="card-text">{item.description}</p>
                          <p className="card-text fw-bold text-success">${item.price}</p>
                        </>
                      ) : (
                        <>
                          <p className="card-text">{item.textileType}</p>
                          <p className="card-text text-muted">{item.location}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p className="text-muted">No textile items available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextileCategoryPage;
