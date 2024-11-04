import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Descriptions, Image, Button, Space, Row, Col } from 'antd';
import { ShoppingOutlined, UserOutlined, DollarCircleOutlined, TagOutlined } from '@ant-design/icons';

let DetailsProductComponent = () => {
    const { id } = useParams();
    let navigate = useNavigate();

    let [product, setProduct] = useState({});

    useEffect(() => {
        getProduct(id);
    }, [id]);

    let buyProduct = async () => {
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
                // Optionally, add feedback to the user on successful purchase
            }
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    let getProduct = async (id) => {
        let response = await fetch(
            process.env.REACT_APP_BACKEND_BASE_URL + "/products/" + id,
            {
                method: "GET",
                headers: {
                    "apikey": localStorage.getItem("apiKey")
                },
            }
        );

        if (response.ok) {
            let jsonData = await response.json();
            setProduct(jsonData);
        } else {
            let responseBody = await response.json();
            let serverErrors = responseBody.errors;
            serverErrors.forEach(e => {
                console.log("Error: " + e.msg);
            });
        }
    };

    let goToSellerProfile = () => {
        navigate(`/users/${product.sellerId}`);
    };

    const { Text, Title } = Typography;
    let labelProductPrice = product.price < 10000 ? "Oferta" : "No-Oferta";

    return (
        <Row justify="center" style={{ marginTop: '20px' }}>
            <Col xs={24} sm={20} md={18} lg={16} xl={14}>
                <Card style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                    <Row gutter={24}>
                        {/* Image Column */}
                        <Col xs={24} md={10}>
                            <Image
                                src={product.image || "/item1.png"}
                                alt={product.title}
                                style={{ borderRadius: '10px', width: '100%' }}
                            />
                        </Col>

                        {/* Product Information Column */}
                        <Col xs={24} md={14}>
                            <Title level={3}>{product.title}</Title>
                            <Descriptions bordered layout="vertical" column={1}>
                                <Descriptions.Item label={<TagOutlined />}>
                                    <Text>{product.category}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Description">
                                    {product.description || "No description available."}
                                </Descriptions.Item>
                                <Descriptions.Item label="Price">
                                    <Space>
                                        <DollarCircleOutlined />
                                        <Text strong style={{ fontSize: 20 }}>
                                            €{product.price?.toFixed(2)}
                                        </Text>
                                        <Text type="secondary" style={{ marginLeft: 8 }}>
                                            {labelProductPrice}
                                        </Text>
                                    </Space>
                                </Descriptions.Item>
                            </Descriptions>
                            <Space style={{ marginTop: '20px' }}>
                                <Button
                                    type="primary"
                                    onClick={buyProduct}
                                    icon={<ShoppingOutlined />}
                                    size="large"
                                >
                                    Buy
                                </Button>
                                <Button
                                    onClick={goToSellerProfile}
                                    icon={<UserOutlined />}
                                    size="large"
                                >
                                    Seller Profile
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};

export default DetailsProductComponent;
