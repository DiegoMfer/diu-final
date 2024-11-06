import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, Col, Row, Input, Checkbox, Slider, Button, message } from 'antd';
import { iconCategories } from "../../Utils/UtilsCategories";

let ListProductsComponent = () => {
    let [products, setProducts] = useState([]);
    let [filteredProducts, setFilteredProducts] = useState([]);

    const [searchParams] = useSearchParams(); // Access query parameters
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [titleFilter, setTitleFilter] = useState('');
    const [priceRange, setPriceRange] = useState([0, 1000]);

    useEffect(() => {
        getProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, categoryFilter, titleFilter, priceRange]);

    let getProducts = async () => {
        let response = await fetch(process.env.REACT_APP_BACKEND_BASE_URL + "/products", {
            method: "GET",
            headers: {
                "apikey": localStorage.getItem("apiKey")
            },
        });

        if (response.ok) {
            let jsonData = await response.json();
            let promisesForImages = jsonData.map(async p => {
                let urlImage = process.env.REACT_APP_BACKEND_BASE_URL + "/images/" + p.id + ".png";
                let existsImage = await checkURL(urlImage);
                p.image = existsImage ? urlImage : "/imageMockup.png";
                return p;
            });

            let productsWithImage = await Promise.all(promisesForImages);
            setProducts(productsWithImage);
            setFilteredProducts(productsWithImage); // Initialize filtered products

            // Check for category in query parameters
            const categoryParam = searchParams.get('category');
            if (categoryParam) {
                setCategoryFilter([categoryParam]); // Set category filter from query param
            }
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    let checkURL = async (url) => {
        try {
            let response = await fetch(url);
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const applyFilters = () => {
        let filtered = products.filter(product => {
            const withinPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
            const matchesCategory = categoryFilter.length > 0 ? categoryFilter.includes(product.category) : true;
            const matchesTitle = titleFilter ? product.title.toLowerCase().includes(titleFilter.toLowerCase()) : true;

            return withinPriceRange && matchesCategory && matchesTitle;
        });
        setFilteredProducts(filtered);
    };

    const buyProduct = async (id) => {
        let response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/transactions/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json ",
                    "apikey": localStorage.getItem("apiKey")
                },
                body: JSON.stringify({
                    productId: id
                })
            }
        );

        if (response.ok) {
            let jsonData = await response.json();
            if (jsonData.affectedRows === 1) {
                message.success('Purchase successful!');
            }
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
                message.error('Purchase failed: ' + e.msg);
            });
        }
    };

    const handleQuickBuy = (product) => {
        console.log("Quick Buy for: ", product);
        buyProduct(product.id);
    };

    return (
        <div>
            <h2>Products</h2>
            <Row gutter={16}>
                {/* Left Column: Filtering */}
                <Col xs={24} sm={8} md={6}>
                    <Card title="Filter Products" bordered>
                        {/* Checkbox group with each checkbox and label aligned inline */}
                        <Checkbox.Group
                            onChange={setCategoryFilter}
                            style={{ display: 'block', width: '100%' }}
                            value={categoryFilter} // Controlled component
                        >
                            {iconCategories.map((c, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <Checkbox value={c.name} style={{ marginRight: '10px' }} />
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        {c.icon} {c.name}
                                    </span>
                                </div>
                            ))}
                        </Checkbox.Group>

                        <Input
                            placeholder="Search Title"
                            onChange={e => setTitleFilter(e.target.value)}
                            style={{ width: '100%', marginBottom: '10px' }}
                        />
                        <h3 style={{ marginBottom: '10px' }}>Price Range (€)</h3>
                        <Slider
                            range
                            min={0}
                            max={1000}
                            value={priceRange}
                            onChange={setPriceRange}
                            style={{ width: '100%' }}
                        />
                    </Card>
                </Col>

                {/* Right Column: Products List */}
                <Col xs={24} sm={16} md={18}>
                    <Row gutter={[16, 16]}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(p => (
                                <Col key={p.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                                    <Link to={"/products/" + p.id}>
                                        <Card
                                            title={p.title}
                                            cover={<img src={p.image} alt={p.title} />}
                                        >
                                        </Card>
                                    </Link>
                                    <div style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '10px',
                                        marginTop: '10px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: '#f9f9f9'
                                    }}>
                                        <span>{p.price} €</span>
                                        <Button
                                            type="primary"
                                            onClick={(event) => handleQuickBuy(p)}
                                        >
                                            Quick Buy
                                        </Button>
                                    </div>
                                </Col>
                            ))
                        ) : (
                            <Col span={24}>
                                <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px', color: '#888' }}>
                                    No products available with the selected filters.
                                </div>
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>
        </div>
    );
}

export default ListProductsComponent;
