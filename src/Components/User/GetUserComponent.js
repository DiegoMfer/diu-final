import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Avatar, Card, Descriptions, Divider, List, Spin, Typography, Col, Row, Pagination } from "antd";
import { UserOutlined, DollarCircleOutlined, ShoppingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const UserProfile = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState({ user: true, transactions: true, products: true });
    const [error, setError] = useState({ user: null, transactions: null, products: null });

    const [transactionPage, setTransactionPage] = useState(1);
    const [productPage, setProductPage] = useState(1);
    const itemsPerPage = 3;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/users/${id}`, {
                    method: "GET",
                    headers: { "apikey": localStorage.getItem("apiKey") },
                });
                if (!userResponse.ok) throw new Error("Failed to fetch user data");
                const userData = await userResponse.json();
                setUser(userData);
            } catch (error) {
                setError(prev => ({ ...prev, user: error.message }));
            } finally {
                setLoading(prev => ({ ...prev, user: false }));
            }
        };

        const fetchTransactions = async () => {
            try {
                const transactionsResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/transactions/public?sellerId=${id}`, {
                    method: "GET",
                    headers: { "apikey": localStorage.getItem("apiKey") },
                });
                if (!transactionsResponse.ok) throw new Error("Failed to fetch transactions");
                const transactionsData = await transactionsResponse.json();
                setTransactions(transactionsData);
            } catch (error) {
                setError(prev => ({ ...prev, transactions: error.message }));
            } finally {
                setLoading(prev => ({ ...prev, transactions: false }));
            }
        };

        const fetchProducts = async () => {
            try {
                const productsResponse = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/products?sellerId=${id}`, {
                    method: "GET",
                    headers: { "apikey": localStorage.getItem("apiKey") },
                });
                if (!productsResponse.ok) throw new Error("Failed to fetch products");
                const productsData = await productsResponse.json();
                setProducts(productsData);
            } catch (error) {
                setError(prev => ({ ...prev, products: error.message }));
            } finally {
                setLoading(prev => ({ ...prev, products: false }));
            }
        };

        fetchUserData();
        fetchTransactions();
        fetchProducts();
    }, [id]);

    const isLoading = Object.values(loading).some((status) => status);

    if (isLoading) {
        return (
            <Spin tip="Loading profile..." style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }} />
        );
    }

    return (
        <Card style={{ margin: "20px auto", maxWidth: "1000px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}>
            <Row gutter={16}>
                {/* User Info Section */}
                <Col xs={24} sm={24} md={8} style={{ backgroundColor: "#fafafa", padding: "20px", borderRadius: "8px" }}>
                    <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: "#1890ff", marginBottom: "20px" }} />
                    <Title level={3} style={{ color: "#1890ff", marginBottom: 0 }}>{user.name} {user.surname}</Title>
                    <Text type="secondary">{user.email}</Text>
                    <Divider />
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Document ID">{user.documentIdentity}</Descriptions.Item>
                        <Descriptions.Item label="Document Number">{user.documentNumber}</Descriptions.Item>
                        <Descriptions.Item label="Country">{user.country}</Descriptions.Item>
                        <Descriptions.Item label="Address">{user.address}</Descriptions.Item>
                        <Descriptions.Item label="Postal Code">{user.postalCode}</Descriptions.Item>
                        <Descriptions.Item label="Birthday">{new Date(user.birthday).toLocaleDateString()}</Descriptions.Item>
                    </Descriptions>
                </Col>

                {/* Transactions and Products Section */}
                <Col xs={24} sm={24} md={16}>
                    <Row gutter={16}>
                        {/* Transactions Section */}
                        <Col span={24} style={{ marginBottom: "20px" }}>
                            <Card title={<Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}><DollarCircleOutlined style={{ marginRight: 8, color: "#52c41a" }} />Transactions</Title>} bordered={false}>
                                {transactions.length > 0 ? (
                                    <>
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={transactions.slice((transactionPage - 1) * itemsPerPage, transactionPage * itemsPerPage)}
                                            renderItem={transaction => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={<Avatar icon={<DollarCircleOutlined />} style={{ backgroundColor: "#52c41a" }} />}
                                                        title={`Transaction ID: ${transaction.id}`}
                                                        description={`Amount: ${transaction.amount} | Date: ${new Date(transaction.date).toLocaleDateString()}`}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                        <Pagination
                                            current={transactionPage}
                                            pageSize={itemsPerPage}
                                            total={transactions.length}
                                            onChange={setTransactionPage}
                                            style={{ textAlign: "center", marginTop: "10px" }}
                                        />
                                    </>
                                ) : (
                                    <Alert message="No transactions found" type="info" showIcon />
                                )}
                            </Card>
                        </Col>

                        {/* Products Section */}
                        <Col span={24}>
                            <Card title={<Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}><ShoppingOutlined style={{ marginRight: 8, color: "#faad14" }} />Products for Sale</Title>} bordered={false}>
                                {products.length > 0 ? (
                                    <>
                                        <List
                                            grid={{ gutter: 16, column: 1 }}
                                            dataSource={products.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage)}
                                            renderItem={product => (
                                                <List.Item>
                                                    <Card title={product.name} extra={<span>Price: ${product.price}</span>} style={{ borderRadius: "8px", borderColor: "#faad14" }}>
                                                        <p>{product.description}</p>
                                                        <p>Category: {product.category}</p>
                                                    </Card>
                                                </List.Item>
                                            )}
                                        />
                                        <Pagination
                                            current={productPage}
                                            pageSize={itemsPerPage}
                                            total={products.length}
                                            onChange={setProductPage}
                                            style={{ textAlign: "center", marginTop: "10px" }}
                                        />
                                    </>
                                ) : (
                                    <Alert message="No products for sale" type="info" showIcon />
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    );
};

export default UserProfile;
