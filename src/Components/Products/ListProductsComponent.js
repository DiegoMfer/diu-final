import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, Input, Checkbox, Slider } from 'antd';
import {iconCategories} from "../../Utils/UtilsCategories";

let ListProductsComponent = () => {
    let [products, setProducts] = useState([]);
    let [filteredProducts, setFilteredProducts] = useState([]);

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

    return (
        <div>
            <h2>Products</h2>
            <div style={{ marginBottom: '20px' }}>
                <Checkbox.Group
                    options={iconCategories.map(c => ({
                        label: (
                            <span>
                                {c.icon} {c.name}
                            </span>
                        ),
                        value: c.name
                    }))}
                    onChange={setCategoryFilter}
                    style={{ marginBottom: '10px', display: 'block' }}
                />
                <Input
                    placeholder="Search Title"
                    onChange={e => setTitleFilter(e.target.value)}
                    style={{ width: 200, marginRight: '10px' }}
                />
                <h3 style={{ margin: '10px 0' }}>Price Range (€)</h3>
                <Slider
                    range
                    min={0}
                    max={1000}
                    value={priceRange}
                    onChange={setPriceRange}
                    style={{ width: 300 }}
                />
            </div>

            <Row gutter={[16, 16]}>
                {filteredProducts.map(p => (
                    <Col span={8} key={p.id}>
                        <Link to={"/products/" + p.id}>
                            <Card title={p.title} cover={<img src={p.image} alt={p.title} />}>
                                {p.price} €
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default ListProductsComponent;
